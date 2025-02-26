import { IsOptional } from 'class-validator';

export class UploadDocumentDto {
  @IsOptional()
  metadata?: Record<string, any>;
} 