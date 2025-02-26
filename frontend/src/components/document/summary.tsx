"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, FileText, Copy, Check } from "lucide-react";

interface DocumentSummaryProps {
  summary: string | null;
  summaryError: string | null;
  isSummaryLoading: boolean;
  isRegeneratingSummary: boolean;
  onRegenerateSummary: () => Promise<void>;
}

export default function DocumentSummary({
  summary,
  summaryError,
  isSummaryLoading,
  isRegeneratingSummary,
  onRegenerateSummary,
}: DocumentSummaryProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const isLoading = isSummaryLoading || isRegeneratingSummary;

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleCopy = async () => {
    if (!summary) return;
    
    try {
      await navigator.clipboard.writeText(summary);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Error al copiar:", error);
    }
  };

  if (isCollapsed) {
    return (
      <div className="flex justify-between items-center w-full px-4 py-2 bg-gray-100 cursor-pointer border rounded-md mb-5" onClick={toggleCollapse}>
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium">Document Summary</CardTitle>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Card className="shadow-sm mb-5 rounded-md">
      <CardHeader className="pb-2 pt-3 px-4 bg-gray-100 rounded-t-md">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Document Summary</CardTitle>
          </div>
          <div className="flex items-center space-x-1">
            {summary && !isLoading && !summaryError && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                onClick={handleCopy}
                title="Copiar resumen"
              >
                {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={toggleCollapse}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 py-2">
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="h-4 w-4 border-2 border-t-primary border-r-transparent border-b-primary border-l-transparent rounded-full animate-spin"></div>
            <span className="text-sm">
              {isRegeneratingSummary ? "Regenerating summary..." : "Generating summary..."}
            </span>
          </div>
        ) : summaryError ? (
          <div className="text-sm text-destructive">{summaryError}</div>
        ) : summary ? (
          <div className="max-h-[150px] overflow-y-auto pr-2">
            <p className="text-sm text-foreground/80 whitespace-pre-wrap">{summary}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No summary available for this document.</p>
        )}
      </CardContent>
    </Card>
  );
}

