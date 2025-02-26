declare namespace Express {
  namespace Multer {
    interface File {
      fieldname: string;
      originalname: string;
      mimetype: string;
      size: number;
      buffer: Buffer;
      path?: string;
      destination?: string;
      filename?: string;
      encoding?: string;
    }
  }
} 