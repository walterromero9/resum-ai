import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { RedisService } from '../../redis/redis.service';
import { TextUtilsService } from './text-utils.service';
import { TOPICS_EXTRACTION_SYSTEM_MESSAGE, KEY_PHRASES_EXTRACTION_SYSTEM_MESSAGE } from './prompts';

@Injectable()
export class TopicsService {
  private readonly openai: OpenAI;
  private readonly completionModel = 'gpt-4o-mini';

  constructor(
    private configService: ConfigService,
    private redisService: RedisService,
    private textUtilsService: TextUtilsService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async extractTopics(text: string): Promise<string[]> {
    const cacheKey = `topics:${this.textUtilsService.generateCacheKey(text)}`;
    const cached = await this.redisService.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    

    const limitedText = this.textUtilsService.truncateText(text, 6000);
    
    const response = await this.openai.chat.completions.create({
      model: this.completionModel,
      messages: [
        { role: 'system', content: TOPICS_EXTRACTION_SYSTEM_MESSAGE },
        { role: 'user', content: limitedText },
      ],
      max_tokens: 100,
    });
    
    const topicsContent = response.choices[0]?.message?.content || '';
    const topics = topicsContent
      .split(',')
      .map(topic => topic.trim())
      .filter(topic => topic.length > 0);
    

    await this.redisService.set(cacheKey, JSON.stringify(topics), 60 * 60 * 24);
    
    return topics;
  }

  async extractKeyPhrases(text: string): Promise<string[]> {
    const cacheKey = `keyphrases:${this.textUtilsService.generateCacheKey(text)}`;
    const cached = await this.redisService.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const limitedText = this.textUtilsService.truncateText(text, 6000);
    
    const response = await this.openai.chat.completions.create({
      model: this.completionModel,
      messages: [
        { role: 'system', content: KEY_PHRASES_EXTRACTION_SYSTEM_MESSAGE },
        { role: 'user', content: limitedText },
      ],
      max_tokens: 200,
    });
    
    const keyPhrasesContent = response.choices[0]?.message?.content || '';
    const keyPhrases = keyPhrasesContent
      .split(',')
      .map(phrase => phrase.trim())
      .filter(phrase => phrase.length > 0);
    
    await this.redisService.set(cacheKey, JSON.stringify(keyPhrases), 60 * 60 * 24);
    
    return keyPhrases;
  }
} 