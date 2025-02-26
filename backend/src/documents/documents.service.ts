import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as pdfParse from 'pdf-parse';
import { ConfigService } from '@nestjs/config';
import { AiService } from '../ai/ai.service';

@Injectable()
export class DocumentsService {
  private uploadDir: string;

  constructor(
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>,
    private configService: ConfigService,
    private aiService: AiService,
  ) {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.ensureUploadDirExists();
  }

  private async ensureUploadDirExists() {
    try {
      await fs.access(this.uploadDir);
    } catch (error) {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async uploadDocument(file: Express.Multer.File, metadata?: Record<string, any>) {
    try {
      const fileName = `${Date.now()}-${file.originalname}`;
      const filePath = path.join(this.uploadDir, fileName);
      await fs.writeFile(filePath, file.buffer);

      const content = await this.extractTextFromPdf(file.buffer);

      const document = this.documentsRepository.create({
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        filePath,
        content,
        metadata,
      });

      const savedDocument = await this.documentsRepository.save(document);

      this.processDocumentWithAi(savedDocument.id, content).catch(error => {
        console.error('Error processing document with AI:', error);
      });

      return {
        id: savedDocument.id,
        fileName: savedDocument.fileName,
        fileSize: savedDocument.fileSize,
        createdAt: savedDocument.createdAt,
      };
    } catch (error) {
      console.error('Error during document upload process:', error);
      try {
        const fileName = `${Date.now()}-${file.originalname}`;
        const filePath = path.join(this.uploadDir, fileName);
        await fs.access(filePath);
        await fs.unlink(filePath);
      } catch (cleanupError) {
      }
      throw error;
    }
  }

  private async extractTextFromPdf(buffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(buffer);
      const cleanText = data.text
        .replace(/\x00/g, '')
        .replace(/[\uFFFD\uFFFE\uFFFF]/g, '');
      
      return cleanText;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Error extracting text from PDF');
    }
  }

  private async processDocumentWithAi(documentId: string, content: string) {
    const summary = await this.aiService.generateSummary(content);
    
    const topics = await this.aiService.extractTopics(content);
    
    const keyPhrases = await this.aiService.extractKeyPhrases(content);
    
    const embedding = await this.aiService.generateEmbedding(content);
    
    await this.documentsRepository.update(documentId, {
      summary,
      topics,
      keyPhrases,
      embedding,
    });
  }

  async findOne(id: string) {
    const document = await this.documentsRepository.findOne({ where: { id } });
    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
    return document;
  }

  async getSummary(id: string) {
    const document = await this.findOne(id);
    return {
      id: document.id,
      fileName: document.fileName,
      summary: document.summary,
      topics: document.topics,
      keyPhrases: document.keyPhrases,
    };
  }

  async regenerateSummary(id: string) {
    const document = await this.findOne(id);
    
    const summary = await this.aiService.generateSummary(document.content);
    
    const topics = await this.aiService.extractTopics(document.content);
    
    const keyPhrases = await this.aiService.extractKeyPhrases(document.content);
    
    await this.documentsRepository.update(id, {
      summary,
      topics,
      keyPhrases,
    });

    return {
      id: document.id,
      fileName: document.fileName,
      summary,
      topics,
      keyPhrases,
    };
  }

  async findAll() {
    const documents = await this.documentsRepository.find({
      select: ['id', 'fileName', 'fileSize', 'createdAt', 'summary', 'topics'],
    });
    return documents;
  }

  async remove(id: string) {
    const document = await this.findOne(id);
    
    try {
      await fs.unlink(document.filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
    
    await this.documentsRepository.remove(document);
    
    return { message: 'Document deleted successfully' };
  }
} 