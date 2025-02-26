import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { RedisModule } from '../redis/redis.module';
import { 
  TextUtilsService, 
  SummaryService, 
  TopicsService, 
  EmbeddingService, 
  ConversationService 
} from './services';

@Module({
  imports: [RedisModule],
  providers: [
    AiService, 
    TextUtilsService,
    SummaryService,
    TopicsService,
    EmbeddingService,
    ConversationService
  ],
  exports: [AiService],
})
export class AiModule {} 