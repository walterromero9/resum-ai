import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface Document {
  id: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
  summary?: string;
  topics?: string[];
  keyPhrases?: string[];
}

export interface QuestionAnswer {
  answer: string;
}

export const documentService = {
  async uploadDocument(file: File, metadata?: any): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }
    
    const response = await axios.post(`${API_URL}/documents/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
  
  async getDocuments(): Promise<Document[]> {
    try {
      console.log('DocumentService: Solicitando lista de documentos a:', `${API_URL}/documents`);
      const response = await axios.get(`${API_URL}/documents`);
      console.log('DocumentService: Respuesta recibida:', response.status, response.statusText);
      return response.data;
    } catch (error: any) {
      console.error('DocumentService: Error al obtener documentos:', error);
      if (error.response) {
        console.error('DocumentService: Status:', error.response.status);
        console.error('DocumentService: Data:', error.response.data);
      }
      throw error;
    }
  },
  
  async getDocument(id: string): Promise<Document> {
    const response = await axios.get(`${API_URL}/documents/${id}`);
    return response.data;
  },
  
  async getDocumentSummary(id: string): Promise<Document> {
    const response = await axios.get(`${API_URL}/documents/summary/${id}`);
    return response.data;
  },
  
  async askQuestion(id: string, question: string): Promise<QuestionAnswer> {
    console.log(`Enviando pregunta a la API para el documento ${id}:`, question);
    
    try {
      const response = await axios.post(`${API_URL}/documents/qa/${id}`, {
        question,
      });
      
      console.log('Respuesta del servidor:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error en la llamada a la API askQuestion:', error);
      throw error;
    }
  },
  
  async deleteDocument(id: string): Promise<{ message: string }> {
    const response = await axios.delete(`${API_URL}/documents/${id}`);
    return response.data;
  },
}; 