import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { RedisService } from '../../redis/redis.service';
import { TextUtilsService } from './text-utils.service';

@Injectable()
export class EmbeddingService {
  private readonly openai: OpenAI;
  private readonly embeddingModel = 'text-embedding-3-small';

  constructor(
    private configService: ConfigService,
    private redisService: RedisService,
    private textUtilsService: TextUtilsService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const cacheKey = `embedding:${this.textUtilsService.generateCacheKey(text)}`;
    const cached = await this.redisService.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const response = await this.openai.embeddings.create({
      model: this.embeddingModel,
      input: this.textUtilsService.truncateText(text, 8000),
    });
    
    const embedding = response.data[0].embedding;
    
    await this.redisService.set(cacheKey, JSON.stringify(embedding), 60 * 60 * 24 * 7);
    
    return embedding;
  }
} 