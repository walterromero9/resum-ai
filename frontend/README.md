# ResumAI Frontend

The ResumAI frontend is a modern web application built with Next.js, React, and TypeScript that provides a user-friendly interface for document analysis, summarization, and AI-powered question answering.

![ResumAI Frontend](/assets/frontend-screenshot.png)

## 🚀 Features

- **Document Management**: Upload, list and manage PDF documents
- **Document Summaries**: View AI-generated summaries of your documents
- **Interactive Chat**: Ask questions about your documents and get AI-powered answers
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Modern UI**: Clean, intuitive interface with shadcn/ui components and Tailwind CSS

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Icons**: [Lucide React](https://lucide.dev/guide/packages/lucide-react)

## 🔧 Installation


1. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Configure environment variables**
   Create a `.env.local` file in the frontend directory with:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

## 🏃 Running the Application

```bash
# Development mode with hot reload
npm run dev
# or
yarn dev

# Build for production
npm run build
# or
yarn build

# Start production server
npm run start
# or
yarn start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 📝 Key Components

- **DocumentList**: Displays a list of uploaded documents
- **DocumentUpload**: Handles document upload functionality
- **DocumentChat**: Provides a chat interface for asking questions about documents
- **DocumentSummary**: Displays AI-generated summaries of documents

## 🔄 API Integration

The frontend communicates with the ResumAI backend API. The main service for API interactions is located at `src/lib/api/document-service.ts`, which handles:

- Document uploads
- Fetching document lists and details
- Retrieving document summaries
- Sending questions and receiving answers

## 🧪 Testing

```bash
# Run tests
npm run test
# or
yarn test
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
