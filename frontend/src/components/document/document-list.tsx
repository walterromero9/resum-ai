"use client";

import { useEffect, useState } from "react";
import { Document, documentService } from "@/lib/api/document-service";
import { FileCheck2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DocumentListProps {
  onSelectDocument: (document: Document) => void;
  selectedDocumentId?: string;
  refreshTrigger?: number;
}

export function DocumentList({
  onSelectDocument,
  selectedDocumentId,
  refreshTrigger = 0,
}: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoading(true);

        const data = await documentService.getDocuments();

        setDocuments(data);
        setError(null);
      } catch (error: any) {
        if (error.response) {
          console.error(
            "DocumentList: Error in response:",
            error.response.status,
            error.response.data
          );
        } else if (error.request) {
          console.error(
            "DocumentList: Error request, no response from server:",
            error.request
          );
        } else {
          console.error(
            "DocumentList: Error in request configuration:",
            error.message
          );
        }

        setError(
          "Error loading the list of documents. Details in console."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [refreshTrigger]);

  const handleDelete = async (e: React.MouseEvent, docId: string) => {
    e.stopPropagation(); 
    setDocumentToDelete(docId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!documentToDelete) return;
    
    try {
      setIsDeleting(documentToDelete);
      await documentService.deleteDocument(documentToDelete);

      setDocuments((prevDocs) => prevDocs.filter((doc) => doc.id !== documentToDelete));

      if (selectedDocumentId === documentToDelete) {
        onSelectDocument(null as any);
      }
    } catch (err) {
      console.error("Error deleting the document:", err);
      alert("Error deleting the document. Please try again.");
    } finally {
      setIsDeleting(null);
      setDocumentToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="h-8 w-8 border-4 border-t-blue-500 border-b-blue-500 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600">Loading documents...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">No documents available</p>
        <p className="text-sm text-gray-400 mt-2">
          Upload a document to start
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full max-h-[calc(100vh-350px)]">
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the document and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ul className="divide-y divide-gray-200">
        {documents.map((doc) => (
          <li
            key={doc.id}
            className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
              selectedDocumentId === doc.id ? "bg-blue-50" : ""
            }`}
            onClick={() => onSelectDocument(doc)}
          >
            <div className="flex items-start">
              <div className="mr-3">
                <FileCheck2 className="h-4 w-4 text-green-500" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {doc.fileName}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(doc.fileSize)} • {formatDate(doc.createdAt)}
                </p>
                {doc.topics && doc.topics.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {doc.topics.map((topic, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="ml-2 flex-shrink-0">
                <button
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors focus:outline-none"
                  onClick={(e) => handleDelete(e, doc.id)}
                  disabled={isDeleting === doc.id}
                  aria-label="Delete document"
                  title="Delete document"
                >
                  {isDeleting === doc.id ? (
                    <div className="h-5 w-5 border-2 border-t-red-500 border-b-red-500 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Trash2 className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
