"use client";

import { useState, useEffect } from "react";
import { Document, documentService } from "@/lib/api/document-service";
import { DocumentUpload } from "@/components/document/document-upload";
import { DocumentList } from "@/components/document/document-list";
import { DocumentChat } from "@/components/document/document-chat";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import Header from "@/components/header/header";
import Footer from "@/components/footer/footer";
export default function Home() {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleDocumentUploadSuccess = async (documentId: string) => {
    try {
      const newDocument = await documentService.getDocument(documentId);

      setRefreshTrigger((prev) => prev + 1);

      setSelectedDocument(newDocument);
    } catch (error) {
      setError("Error. Please refresh the page.");
    }
  };

  return (
    <main className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-8 lg:px-10 py-8 pb-16 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-full">
          <Card className="shadow-sm border-gray-200 flex flex-col">
            <CardHeader className="pb-3 pt-5 px-6">
              <CardTitle className="text-xl">ResumAI</CardTitle>
              <CardDescription className="text-gray-500">
                Analyze and chat with your documents
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6 flex-1 overflow-hidden flex flex-col">
              <DocumentUpload onUploadSuccess={handleDocumentUploadSuccess} />
              <div className="flex-1 overflow-hidden mt-6">
                <DocumentList
                  onSelectDocument={setSelectedDocument}
                  selectedDocumentId={selectedDocument?.id}
                  refreshTrigger={refreshTrigger}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2 overflow-hidden flex flex-col shadow-sm border-gray-200">
            <CardHeader className="pb-2 pt-5 px-6">
              <CardTitle className="text-xl">Document Analysis</CardTitle>
              <CardDescription className="text-gray-500 mb-3">
                Ask questions about your selected document
              </CardDescription>
            </CardHeader>
            <CardContent className="py-0 px-6 flex-1 overflow-hidden">
              <DocumentChat document={selectedDocument} />
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </main>
  );
}
