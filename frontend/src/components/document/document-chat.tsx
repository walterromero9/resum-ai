"use client";

import { useState, FormEvent, useRef, useEffect } from "react";
import {
  Document,
  QuestionAnswer,
  documentService,
} from "@/lib/api/document-service";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import DocumentSummary from "./summary";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquareMore } from "lucide-react";

interface DocumentChatProps {
  document: Document | null;
}

interface Message {
  id: string;
  content: string;
  type: "user" | "assistant";
  timestamp: Date;
}

export function DocumentChat({ document }: DocumentChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [isRegeneratingSummary, setIsRegeneratingSummary] = useState(false);
  const [question, setQuestion] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!document) {
      setSummary(null);
      setSummaryError(null);
      setMessages([]);
      return;
    }

    const loadSummary = async () => {
      try {
        setIsSummaryLoading(true);
        setSummaryError(null);
        const summaryData = await documentService.getDocumentSummary(
          document.id
        );

        if (summaryData.summary) {
          setSummary(summaryData.summary);
        } else {
          setSummaryError(
            "No summary could be generated for this document. The document might be in an incompatible format."
          );
        }
      } catch (error) {
        console.error("Error loading document summary:", error);
        setSummaryError("Error loading document summary. Please try again.");
      } finally {
        setIsSummaryLoading(false);
      }
    };

    loadSummary();

    setMessages([
      {
        id: "welcome",
        content: `"${document.fileName}" selected! You can ask me any question about its content.`,
        type: "assistant",
        timestamp: new Date(),
      },
    ]);
  }, [document]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || !document) return;

    if (
      !document.id ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        document.id
      )
    ) {
      const errorMessage: Message = {
        id: generateId(),
        content: "Error: Invalid document ID. Please select another document.",
        type: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    const userMessage: Message = {
      id: generateId(),
      content: inputValue,
      type: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const answer: QuestionAnswer = await documentService.askQuestion(
        document.id,
        inputValue
      );

      const assistantMessage: Message = {
        id: generateId(),
        content: answer.answer,
        type: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: generateId(),
        content:
          "Sorry, there was an error processing your question. Please try again.",
        type: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateSummary = async () => {
    if (!document) return;

    try {
      setIsRegeneratingSummary(true);
      setSummaryError(null);

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
        }/documents/summary/${document.id}?force=true`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error regenerating summary");
      }

      const summaryData = await response.json();

      if (summaryData.summary) {
        setSummary(summaryData.summary);
      } else {
        setSummaryError(
          "No summary could be generated for this document despite attempts. The document might be in an incompatible format."
        );
      }
    } catch (error) {
      console.error("Error regenerating summary:", error);
      setSummaryError("Error regenerating summary. Please try again later.");
    } finally {
      setIsRegeneratingSummary(false);
    }
  };

  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <MessageSquareMore className="h-12 w-12 text-gray-400 mb-2" />
        <h3 className="text-lg font-medium text-gray-900">
          No document selected
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Select a document from the list to start chatting
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <DocumentSummary
        summary={summary}
        summaryError={summaryError}
        isSummaryLoading={isSummaryLoading}
        isRegeneratingSummary={isRegeneratingSummary}
        onRegenerateSummary={handleRegenerateSummary}
      />

      <Card className="flex-1 flex flex-col shadow-sm rounded-md overflow-hidden">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 relative">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <p>Write a question to start chatting about this document</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.type === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <div
                    className={`text-xs mt-1 ${
                      message.type === "user" ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-2 flex items-center">
                <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce mr-1"></div>
                <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce mr-1 animation-delay-200"></div>
                <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce animation-delay-400"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        <div className="border-t px-6 pt-5 pb-8">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={`Ask a question about ${document?.fileName}...`}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={!question.trim() || isLoading}
              className="shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Asking...
                </>
              ) : (
                "Ask"
              )}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
