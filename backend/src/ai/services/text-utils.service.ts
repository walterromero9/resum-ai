import { Injectable } from '@nestjs/common';

@Injectable()
export class TextUtilsService {
  generateCacheKey(text: string): string {
    return Buffer.from(text.substring(0, 100)).toString('base64');
  }

  truncateText(text: string, maxTokens: number): string {
    const maxChars = maxTokens * 3;
    
    if (text.length <= maxChars) {
      return text;
    }
    
    return text.substring(0, maxChars) + '...';
  }

  splitTextIntoChunks(text: string, maxTokensPerChunk: number): string[] {
    const maxCharsPerChunk = maxTokensPerChunk * 3;
    const chunks: string[] = [];
    
    const paragraphs = text.split(/\n\s*\n/);
    let currentChunk = '';
    
    for (const paragraph of paragraphs) {
      if (paragraph.length > maxCharsPerChunk) {
        if (currentChunk.length > 0) {
          chunks.push(currentChunk);
          currentChunk = '';
        }
        
        let i = 0;
        while (i < paragraph.length) {
          chunks.push(paragraph.substring(i, i + maxCharsPerChunk));
          i += maxCharsPerChunk;
        }
        continue;
      }
      
      if (currentChunk.length + paragraph.length + 2 > maxCharsPerChunk) {
        chunks.push(currentChunk);
        currentChunk = paragraph;
      } else {
        if (currentChunk.length > 0) {
          currentChunk += '\n\n';
        }
        currentChunk += paragraph;
      }
    }
    
    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }
    
    return chunks;
  }
} 