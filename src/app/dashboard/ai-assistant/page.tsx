"use client";

import { useEffect, useState, useRef } from "react";
import { Bot, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppSelector } from "@/redux/store";
import dayjs from "dayjs";
import { Message as BaseMessage } from "@/lib/types";

// Extend Message type to include error property
interface Message extends BaseMessage {
  error?: boolean;
}
import { writeToDoc } from "@/lib/firebase/firestore";
import { v4 } from "uuid";
import { useChat } from "@/lib/hooks/useChat";
import { Skeleton } from "@/components/ui/skeleton";

export default function AIAssistantPage() {
  const [input, setInput] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const dbuser = useAppSelector((state) => state.DBUserReducer.value);
  const servermessages = useAppSelector((state) => state.MessagesReducer.value);
  const workshops = useAppSelector((state) => state.AdminWorkshopReducer.value);
  const registrations = useAppSelector(
    (state) => state.AdminRegistrationReducer.value
  );
  const [messages, setMessages] = useState<Message[]>([]);

  const { sendMessage, isLoading, error } = useChat();

  // Set initial message on component mount
  useEffect(() => {
    if (servermessages === undefined) {
      // loading
      return
    }
    if (!servermessages || servermessages.length === 0) {
      const initialMessage: Message = {
        role: "assistant",
        timestamp: dayjs().valueOf(),
        uid: dbuser?.uid || "",
        content:
          "Hello! I'm your AI workshop assistant. You can ask me questions about your workshops, registrations, or for insights about your data. How can I help you today?",
      };

      // setMessages([initialMessage]);
      // setIsFirstLoad(false);

      // Save the initial message if there are no server messages
      if (!servermessages || servermessages.length === 0) {
        writeToDoc("messages", v4(), initialMessage);
      }
    } else {
      setMessages(servermessages);
    }
  }, [dbuser?.uid, servermessages]);

  // Load messages from server
  // useEffect(() => {
  //   if (servermessages && servermessages.length > 0) {
  //     setMessages(servermessages);
  //   }
  // }, [servermessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Prepare workshop data for the AI
  const prepareWorkshopData = () => {
    if (!workshops) return [];

    return workshops.map((workshop) => ({
      id: workshop.docID,
      title: workshop.title,
      description: workshop.description,
      category: workshop.category,
      level: workshop.level,
      status: workshop.status,
      startDate: workshop.startDate
        ? new Date(workshop.startDate).toISOString()
        : null,
      endDate: workshop.endDate
        ? new Date(workshop.endDate).toISOString()
        : null,
      capacity: workshop.capacity,
      registeredCount: workshop.registeredCount || 0,
      waitlistCount: workshop.waitlistCount || 0,
      isFree: workshop.isFree,
      price: workshop.price,
    }));
  };

  // Prepare registration data for the AI
  const prepareRegistrationData = () => {
    if (!registrations) return [];

    return registrations.map((reg) => ({
      workshopId: reg.workshopId,
      studentId: reg.studentId,
      status: reg.status,
      registrationDate: reg.registeredAt
        ? new Date(reg.registeredAt).toISOString()
        : null,
      attendanceStatus: reg.status || "unconfirmed",
    }));
  };

  const handleSend = async () => {
    if (!dbuser?.uid) return;
    if (!input.trim()) return;

    // Add user message to UI
    const userMessage: Message = {
      role: "user",
      uid: dbuser?.uid || "",
      content: input,
      timestamp: dayjs().valueOf(),
    };

    // Save user message to Firestore
    writeToDoc("messages", v4(), userMessage);

    // Update UI with user message
    // setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Prepare context data
    const contextData = {
      workshops: prepareWorkshopData(),
      registrations: prepareRegistrationData(),
    };

    try {
      // Send message to AI with workshop context
      const response = await sendMessage(input, contextData);

      // Format and save AI response
      const assistantMessage: Message = {
        role: "assistant",
        content: response,
        timestamp: dayjs().valueOf(),
        uid: dbuser?.uid || "",
      };

      // Save AI message to Firestore
      writeToDoc("messages", v4(), assistantMessage);

      // Update UI with AI message
      // setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Error in AI response:", err);

      // Show error message
      const errorMessage: Message = {
        role: "assistant",
        content:
          "Sorry, I encountered an error processing your request. Please try again later.",
        timestamp: dayjs().valueOf(),
        uid: dbuser?.uid || "",
      };

      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[100vw] overflow-hidden">
      <div className="flex flex-col gap-2 sr-only sm:not-sr-only">
        <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
        <p className="text-muted-foreground">
          Ask questions about your workshops and get AI-powered insights.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 w-full">
        <div className="md:col-span-2">
          <Card className="h-[calc(100vh-13rem)]">
            <CardHeader className="">
              <CardTitle>Workshop Assistant</CardTitle>
              <CardDescription>
                Ask questions about your workshops, registrations, and more.
              </CardDescription>
            </CardHeader>
            <CardContent
              className="h-[calc(65vh-9.5rem)] overflow-y-auto pb-0"
              ref={chatContainerRef}
            >
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex max-w-[80%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                      message.role === "user"
                        ? "ml-auto bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {message.role === "assistant" ? (
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src="/placeholder.svg?height=24&width=24"
                            alt="AI"
                          />
                          <AvatarFallback>
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src="/placeholder.svg?height=24&width=24"
                            alt="User"
                          />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <span className="text-xs font-medium">
                        {message.role === "user" ? "You" : "AI Assistant"}
                      </span>
                    </div>
                    <div className="whitespace-pre-line">{message.content}</div>
                    {message.error && (
                      <div className="text-xs text-destructive mt-1">
                        Error processing request
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex max-w-[80%] flex-col gap-2 rounded-lg px-3 py-2 text-sm bg-muted">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium">AI Assistant</span>
                    </div>
                    <div className="flex gap-1.5">
                      <Skeleton className="h-2 w-2 rounded-full animate-pulse bg-primary/40" />
                      <Skeleton className="h-2 w-2 rounded-full animate-pulse bg-primary/40 animation-delay-200" />
                      <Skeleton className="h-2 w-2 rounded-full animate-pulse bg-primary/40 animation-delay-500" />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="mt-5">
              <div className="flex w-full items-center space-x-2">
                <Input
                  placeholder="Ask a question about your workshops..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
        <div>
          <Card className="h-[calc(100vh-13rem)]">
            <CardHeader>
              <CardTitle>Suggested Questions</CardTitle>
              <CardDescription>
                Try asking these questions to get started.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start text-left text-wrap py-8"
                  onClick={() => {
                    setInput("What's my most popular workshop?");
                  }}
                  disabled={isLoading}
                >
                  What's my most popular workshop?
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left text-wrap py-8"
                  onClick={() => {
                    setInput("How many registrations do I have in total?");
                  }}
                  disabled={isLoading}
                >
                  How many registrations do I have in total?
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left text-wrap py-8"
                  onClick={() => {
                    setInput("What are my upcoming workshops?");
                  }}
                  disabled={isLoading}
                >
                  What are my upcoming workshops?
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left text-wrap py-8"
                  onClick={() => {
                    setInput("Give me insights about my workshop attendance");
                  }}
                  disabled={isLoading}
                >
                  Give me insights about my workshop attendance
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left text-wrap py-8"
                  onClick={() => {
                    setInput("What's the current registration trend?");
                  }}
                  disabled={isLoading}
                >
                  What's the current registration trend?
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
