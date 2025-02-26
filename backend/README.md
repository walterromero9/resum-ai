# ResumAI API: AI-Powered Document Analysis Backend

ResumAI API is a powerful NestJS-based backend that provides text extraction, summarization, and analysis capabilities for PDF documents using state-of-the-art AI models.

## 🚀 Features

- **PDF Processing**: Upload and extract text from PDF documents
- **AI-Powered Analysis**: Generate summaries, extract key insights, and identify important topics
- **Question & Answer System**: Ask specific questions about uploaded documents and get AI-generated answers
- **Semantic Search**: Find semantically similar documents using vector-based search with pgvector
- **Efficient Caching**: Redis-based caching for improved performance
- **Scalable Architecture**: Designed for horizontal scaling and high availability

## 🛠️ Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) with TypeScript
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [pgvector](https://github.com/pgvector/pgvector) extension
- **AI Integration**: [OpenAI API](https://openai.com/blog/openai-api)
- **PDF Processing**: PDF parsing and text extraction
- **Caching**: [Redis](https://redis.io/) for performance optimization
- **Containerization**: Docker and Docker Compose support

## 📋 Requirements

- Node.js (v16 or higher)
- PostgreSQL (with pgvector extension installed)
- Redis Server
- OpenAI API Key

## 📦 Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   Create a `.env` file based on the provided `.env.example`:

   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your configuration values:
   - Database credentials
   - OpenAI API key
   - Redis configuration
   - Other environment-specific settings

3. **Set up PostgreSQL with pgvector**

   Make sure the pgvector extension is installed in your PostgreSQL database:

   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

## 🏃 Running the Application

### Development Mode

```bash
# Start the development server with hot reload
npm run start:dev

# Start the development server with debugging enabled
npm run start:debug
```

### Production Mode

```bash
# Build the application
npm run build

# Start in production mode
npm run start:prod
```

### Using Docker Compose

```bash
# Start all services (PostgreSQL, Redis, and API)
npm run docker:up
# or
docker-compose up -d

# Stop all services
npm run docker:down
# or
docker-compose down

# Combined development workflow
npm run dev
```

## 🔌 API Endpoints

### Document Management

- **POST /documents/upload** - Upload a PDF document
  - Request: `multipart/form-data` with a PDF file
  - Response: Document ID and metadata

- **GET /documents** - List all documents
  - Response: Array of documents with their metadata

- **GET /documents/:id** - Get document details
  - Response: Document details including metadata

- **DELETE /documents/:id** - Delete a document
  - Response: Success message

### AI Analysis

- **GET /documents/summary/:id** - Get summary of a document
  - Response: Document summary, key topics, and phrases

- **POST /documents/qa/:id** - Ask a question about a document
  - Request: `{ "question": "Your question here" }`
  - Response: Answer based on document content

### Semantic Search

- **GET /search?query=xxx&limit=10** - Search across documents
  - Query Parameters:
    - `query`: The search query
    - `limit`: Maximum number of results (default: 10)
  - Response: Array of matching documents with relevance scores

## 📝 Usage Examples

### Upload a Document

```bash
curl -X POST http://localhost:3000/documents/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/your/document.pdf" \
  -F "metadata={\"tags\":[\"research\",\"ai\"]}"
```

### Get a Summary

```bash
curl -X GET http://localhost:3000/documents/summary/document_id_here
```

### Ask a Question

```bash
curl -X POST http://localhost:3000/documents/qa/document_id_here \
  -H "Content-Type: application/json" \
  -d '{"question":"What are the main findings in this document?"}'
```

### Search Documents

```bash
curl -X GET "http://localhost:3000/search?query=artificial%20intelligence&limit=5"
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
