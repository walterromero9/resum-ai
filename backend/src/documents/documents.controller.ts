import { Body, Controller, Delete, Get, Param, Post, UploadedFile, UseInterceptors, HttpException, HttpStatus, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { QuestionDto } from './dto/question.dto';
import { AiService } from '../ai/ai.service';

@Controller('documents')
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly aiService: AiService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDocumentDto: UploadDocumentDto,
  ) {
    try {
      if (!file) {
        throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
      }
      
      if (file.mimetype !== 'application/pdf') {
        throw new HttpException('Only PDF files are allowed', HttpStatus.BAD_REQUEST);
      }
      
      return await this.documentsService.uploadDocument(file, uploadDocumentDto.metadata);
    } catch (error) {
      console.error('Error in uploadDocument controller:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error processing document upload: ' + (error.message || 'Unknown error'),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get()
  async findAll() {
    return this.documentsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  @Get('summary/:id')
  async getSummary(
    @Param('id') id: string,
    @Query('force') force?: string,
  ) {
    const document = await this.documentsService.findOne(id);
    
    if (force === 'true' || !document.summary) {
      return this.documentsService.regenerateSummary(id);
    }
    
    return {
      id: document.id,
      fileName: document.fileName,
      summary: document.summary,
      topics: document.topics,
      keyPhrases: document.keyPhrases,
    };
  }

  @Post('qa/:id')
  async answerQuestion(
    @Param('id') id: string,
    @Body() questionDto: QuestionDto,
  ) {
    const document = await this.documentsService.findOne(id);
    return this.aiService.answerQuestion(document.content, questionDto.question, id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.documentsService.remove(id);
  }
}