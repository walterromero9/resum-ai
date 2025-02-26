import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { RedisService } from '../../redis/redis.service';
import { TextUtilsService } from './text-utils.service';
import { SUMMARY_SYSTEM_MESSAGE, SUMMARY_COMBINE_SYSTEM_MESSAGE } from './prompts';

@Injectable()
export class SummaryService {
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

  async generateSummary(text: string): Promise<string> {
    const cacheKey = `summary:${this.textUtilsService.generateCacheKey(text)}`;
    const cached = await this.redisService.get(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    if (text.length > 4000 * 3) {
      const chunks = this.textUtilsService.splitTextIntoChunks(text, 4000);
      const summariesPromises = chunks.map(async (chunk, index) => {
        const response = await this.openai.chat.completions.create({
          model: this.completionModel,
          messages: [
            { role: 'system', content: SUMMARY_SYSTEM_MESSAGE },
            { role: 'user', content: chunk },
          ],
          max_tokens: 500,
        });
        return response.choices[0]?.message?.content || '';
      });
      
      const chunkSummaries = await Promise.all(summariesPromises);

      const finalSummary = await this.combineSummaries(chunkSummaries);
      await this.redisService.set(cacheKey, finalSummary, 60 * 60 * 24);
      
      return finalSummary;
    }
    
    const limitedText = this.textUtilsService.truncateText(text, 6000);
    
    const response = await this.openai.chat.completions.create({
      model: this.completionModel,
      messages: [
        { role: 'system', content: SUMMARY_SYSTEM_MESSAGE },
        { role: 'user', content: limitedText },
      ],
      max_tokens: 500,
    });
    
    const summary = response.choices[0]?.message?.content || '';
    
    await this.redisService.set(cacheKey, summary, 60 * 60 * 24);
    
    return summary;
  }

  private async combineSummaries(summaries: string[]): Promise<string> {
    if (summaries.length === 1) {
      return summaries[0];
    }
    
    const combinedText = summaries.join('\n\n--- Next Section ---\n\n');
    const limitedText = this.textUtilsService.truncateText(combinedText, 6000);
    
    const response = await this.openai.chat.completions.create({
      model: this.completionModel,
      messages: [
        { 
          role: 'system', 
          content: SUMMARY_COMBINE_SYSTEM_MESSAGE
        },
        { role: 'user', content: limitedText },
      ],
      max_tokens: 1000,
    });
    
    return response.choices[0]?.message?.content || 'A combined summary could not be generated.';
  }
} 