import { IsNotEmpty, IsString } from 'class-validator';

export class QuestionDto {
  @IsNotEmpty()
  @IsString()
  question: string;
} 