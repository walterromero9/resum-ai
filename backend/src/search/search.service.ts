import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../documents/entities/document.entity';
import { AiService } from '../ai/ai.service';
import { SearchQueryDto } from './dto/search-query.dto';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>,
    private aiService: AiService,
  ) {}

  async search(searchQueryDto: SearchQueryDto): Promise<any[]> {
    const { query, limit } = searchQueryDto;

    const queryEmbedding = await this.aiService.generateEmbedding(query);

    const results = await this.documentsRepository
      .createQueryBuilder('document')
      .select([
        'document.id',
        'document.fileName',
        'document.summary',
        'document.topics',
        'document.keyPhrases',
        'document.createdAt',
      ])
      .addSelect(`document.embedding <-> :embedding`, 'distance')
      .where('document.embedding IS NOT NULL')
      .orderBy('distance', 'ASC')
      .setParameter('embedding', JSON.stringify(queryEmbedding))
      .limit(limit)
      .getMany();

    return results.map(doc => ({
      id: doc.id,
      fileName: doc.fileName,
      summary: doc.summary,
      topics: doc.topics,
      keyPhrases: doc.keyPhrases,
      createdAt: doc.createdAt,
      distance: doc['distance'],
    }));
  }
} 