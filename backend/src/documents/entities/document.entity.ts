import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  fileName: string;

  @Column({ nullable: false })
  fileSize: number;

  @Column({ nullable: false })
  mimeType: string;

  @Column({ nullable: false })
  filePath: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column('simple-array', { nullable: true })
  keyPhrases: string[];

  @Column('simple-array', { nullable: true })
  topics: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'float', array: true, nullable: true })
  embedding: number[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 