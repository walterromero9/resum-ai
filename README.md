# ResumAI: AI-Powered Document Analysis Platform

ResumAI is a comprehensive document analysis platform that leverages AI to extract insights, generate summaries, and provide interactive question-answering capabilities for PDF documents.

## 🚀 Features

- **Document Management**: Upload, view, and manage PDF documents in a clean interface
- **AI-Powered Analysis**: Automatically generate summaries, key topics, and insights
- **Interactive Chat**: Ask questions about your documents and get intelligent answers
- **Semantic Search**: Find documents related to specific topics or questions
- **Responsive Design**: Optimized user experience across desktop and mobile devices

## 🏗️ Architecture

ResumAI uses a modern stack with separate frontend and backend services:

### Frontend (Next.js)
- **UI Framework**: Next.js with React and TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Hooks and Context API
- **API Communication**: Axios for REST API calls

### Backend (NestJS)
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with pgvector for vector embeddings
- **AI Integration**: OpenAI API for document analysis
- **Caching**: Redis for performance optimization
- **Document Processing**: PDF parsing and text extraction

## 🛠️ Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (with pgvector extension)
- Redis
- Docker and Docker Compose (optional, for containerized setup)

### Running the Application

1. **Clone the repository**
   ```bash
   git clone
   cd resumAI
   ```

2. **Start the Backend API**
   ```bash
   cd resumai-api
   npm install
   npm run dev
   ```

3. **Start the Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Using Docker Compose (Alternative)**
   ```bash
   docker-compose up -d
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001


## 📝 Usage

1. **Upload Documents**: Drag and drop PDF files in the upload area
2. **View Summaries**: Automatically generated summaries appear for each document
3. **Ask Questions**: Use the chat interface to ask questions about your documents
4. **Manage Documents**: View, delete or search through your document collection

## 🧠 AI Capabilities

ResumAI utilizes OpenAI's models to provide:
- Document summarization with key points extraction
- Topic identification and categorization
- Natural language question answering based on document content
- Semantic search across your document collection

## 📊 Performance and Scaling

- Optimized for documents up to 50MB in size
- Vector embeddings allow for efficient semantic similarity search
- Redis caching improves response times for repeated operations
- Containerized deployment supports easy scaling

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details. 