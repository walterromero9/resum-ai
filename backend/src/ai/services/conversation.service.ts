import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { RedisService } from '../../redis/redis.service';
import { TextUtilsService } from './text-utils.service';
import { ChatOpenAI } from "@langchain/openai";
import { ChatMessageHistory } from "langchain/memory";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { CONVERSATION_SYSTEM_MESSAGE, LANGCHAIN_SYSTEM_MESSAGE } from './prompts';

interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

@Injectable()
export class ConversationService {
  private readonly openai: OpenAI;
  private readonly completionModel = 'gpt-4o-mini';
  private readonly chatHistories = new Map<string, ChatMessageHistory>();

  constructor(
    private configService: ConfigService,
    private redisService: RedisService,
    private textUtilsService: TextUtilsService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async answerQuestion(documentContent: string, question: string, documentId?: string): Promise<{ answer: string }> {
    if (documentId) {
      try {
        return await this.answerQuestionWithLangChain(documentContent, question, documentId);
      } catch (error) {
        console.error('Error in LangChain', error);
      }
    }
    
    let conversationHistory: ConversationMessage[] = [];
    
    if (documentId) {
      const historyKey = `history:${documentId}`;
      const cachedHistory = await this.redisService.get(historyKey);
      
      if (cachedHistory) {
        try {
          conversationHistory = JSON.parse(cachedHistory);
        } catch (error) {
          conversationHistory = [];
        }
      }
      
      if (conversationHistory.length > 10) {
        conversationHistory = conversationHistory.slice(conversationHistory.length - 10);
      }
    }
    
    conversationHistory.push({ role: 'user', content: question });
    
    try {
      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        { 
          role: 'system', 
          content: CONVERSATION_SYSTEM_MESSAGE
        },
        { 
          role: 'system', 
          content: `Document: ${this.textUtilsService.truncateText(documentContent, 4000)}` 
        },
      ];
      
      for (const msg of conversationHistory) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role,
            content: msg.content
          });
        }
      }
      
      const response = await this.openai.chat.completions.create({
        model: this.completionModel,
        messages: messages,
        max_tokens: 500,
      });
      
      const answer = response.choices[0]?.message?.content?.trim() || 'A response could not be generated.';
      
      conversationHistory.push({ role: 'assistant', content: answer });
      
      if (documentId) {
        const historyKey = `history:${documentId}`;
        await this.redisService.set(historyKey, JSON.stringify(conversationHistory), 60 * 60 * 2);
      }
      
      return { answer };
    } catch (error) {
      throw new Error('Error processing question: ' + (error.message || 'Unknown'));
    }
  }

  async answerQuestionWithLangChain(documentContent: string, question: string, documentId: string): Promise<{ answer: string }> {
    
    try {
      let messageHistory: ChatMessageHistory;
      
      if (this.chatHistories.has(documentId)) {
        const existingHistory = this.chatHistories.get(documentId);
        messageHistory = existingHistory ? existingHistory : new ChatMessageHistory();
      } else {
        const historyKey = `history:${documentId}`;
        const cachedHistory = await this.redisService.get(historyKey);
        
        messageHistory = new ChatMessageHistory();
        
        if (cachedHistory) {
          try {
            const parsedHistory = JSON.parse(cachedHistory);

            for (const msg of parsedHistory) {
              if (msg.role === 'user') {
                await messageHistory.addMessage(new HumanMessage(msg.content));
              } else if (msg.role === 'assistant') {
                await messageHistory.addMessage(new AIMessage(msg.content));
              }
            }
          } catch (error) {
            console.error('Error parsing history from Redis:', error);
          }
        }
        
        this.chatHistories.set(documentId, messageHistory);
      }
      
      const model = new ChatOpenAI({
        modelName: this.completionModel,
        temperature: 0.7,
        openAIApiKey: this.configService.get<string>('OPENAI_API_KEY'),
      });
      
      const messages = [
        new SystemMessage(
          LANGCHAIN_SYSTEM_MESSAGE(this.textUtilsService.truncateText(documentContent, 4000))
        ),
      ];
      
      const historyMessages = await messageHistory.getMessages();
      messages.push(...historyMessages);
      
      messages.push(new HumanMessage(question));
      
      const response = await model.call(messages);
      
      await messageHistory.addMessage(new HumanMessage(question));
      
      const responseContent = typeof response.content === 'string' 
        ? response.content 
        : JSON.stringify(response.content);
      
      await messageHistory.addMessage(new AIMessage(responseContent));
      
      const updatedMessages = await messageHistory.getMessages();
      const formattedMessages = updatedMessages.map(msg => {
        if (msg._getType() === 'human') {
          return { role: 'user', content: msg.content };
        } else if (msg._getType() === 'ai') {
          return { role: 'assistant', content: msg.content };
        } else if (msg._getType() === 'system') {
          return { role: 'system', content: msg.content };
        }
        return null;
      }).filter(Boolean);
      
      const historyKey = `history:${documentId}`;
      await this.redisService.set(historyKey, JSON.stringify(formattedMessages), 60 * 60 * 2); 
      
      return { answer: responseContent };
    } catch (error) {
      console.error('Error processing question with LangChain:', error);
      
      console.log('Using alternative method as fallback');
      return this.answerQuestion(documentContent, question, documentId);
    }
  }
} 