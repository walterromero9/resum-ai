'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { documentService } from '@/lib/api/document-service';
import { FilePlus } from 'lucide-react';

interface DocumentUploadProps {
  onUploadSuccess: (documentId: string) => void;
}

export function DocumentUpload({ onUploadSuccess }: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      
      if (!file) return;
      
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are allowed');
        return;
      }

      try {
        setError(null);
        setIsUploading(true);
        
        const response = await documentService.uploadDocument(file);
        
        onUploadSuccess(response.id);
      } catch (err) {
        console.error('Error uploading document:', err);
        setError('Error uploading document. Please try again.');
      } finally {
        setIsUploading(false);
      }
    },
    [onUploadSuccess]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
        }`}
      >
        <input {...getInputProps()} />
        
        {isUploading ? (
          <div className="flex flex-col items-center justify-center">
            <div className="h-8 w-8 border-4 border-t-blue-500 border-b-blue-500 border-l-transparent border-r-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-gray-600">Uploading document...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <FilePlus className="h-8 w-8 text-gray-600" />
            {isDragActive ? (
              <p className="text-blue-500">Drop the PDF here...</p>
            ) : (
              <p className="text-gray-600">
                Drag and drop a PDF here, or click to select a file
              </p>
            )}
            <p className="text-gray-500 text-sm mt-2">Only PDF files are accepted</p>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-2 text-red-500 text-sm">{error}</div>
      )}
    </div>
  );
} 