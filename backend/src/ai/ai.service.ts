import { Injectable } from '@nestjs/common';
import { SummaryService, TopicsService, EmbeddingService, ConversationService } from './services';

@Injectable()
export class AiService {
  constructor(
    private summaryService: SummaryService,
    private topicsService: TopicsService,
    private embeddingService: EmbeddingService,
    private conversationService: ConversationService
  ) {}

  async generateSummary(text: string): Promise<string> {
    return this.summaryService.generateSummary(text);
  }

  async extractTopics(text: string): Promise<string[]> {
    return this.topicsService.extractTopics(text);
  }

  async extractKeyPhrases(text: string): Promise<string[]> {
    return this.topicsService.extractKeyPhrases(text);
  }

  async generateEmbedding(text: string): Promise<number[]> {
    return this.embeddingService.generateEmbedding(text);
  }

  async answerQuestion(documentContent: string, question: string, documentId?: string): Promise<{ answer: string }> {
    return this.conversationService.answerQuestion(documentContent, question, documentId);
  }
} 