"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bot, Send, User } from "lucide-react";
import { useAppSelector } from "@/redux/store";

export default function ChatbotDemo() {
  // Get workshops data from Redux store (only non-sensitive information)
  const workshops = useAppSelector((state) => state.WorkshopReducer.value);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState([
    {
      role: "bot",
      content:
        "Hello! I'm your Smart Enroll assistant. How can I help you today? You can ask about workshops, registration process, or platform features. Note that only workshop organizers need to create accounts - students can register directly!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Prepare workshop information
  const getWorkshopInfo = () => {
    let workshopInfo = "No workshops currently available.";

    if (workshops && workshops.length > 0) {
      const activeWorkshops = workshops.filter(
        (w) => w.status === "upcoming" || w.status === "ongoing"
      );
      if (activeWorkshops.length > 0) {
        workshopInfo = `Currently available workshops (${activeWorkshops.length} total):\n`;
        activeWorkshops.slice(0, 5).forEach((workshop, index) => {
          workshopInfo += `- "${workshop.title}" - ${
            workshop.category || "General"
          } (${workshop.level || "All levels"})\n`;
        });
        if (activeWorkshops.length > 5) {
          workshopInfo += `- And ${
            activeWorkshops.length - 5
          } more workshops\n`;
        }
      }
    }
    return workshopInfo;
  };

  // Call the server-side API instead of directly using Gemini
  const askAssistant = async (userMessage: string) => {
    try {
      // Get limited chat history (only last 3 messages)
      const history =
        messages.length > 3
          ? messages.slice(-3)
          : messages.length > 1
          ? messages
          : [];

      // Call our secure API endpoint
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          history: history,
          workshopInfo: getWorkshopInfo(),
          systemInfo:
            "IMPORTANT: Only workshop organizers need to create accounts. Students do NOT need accounts to register for workshops - they can register directly.",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error:", errorData);
        throw new Error(errorData.error || "Network response was not ok");
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("Error calling chat API:", error);
      return getFallbackResponse(userMessage);
    }
  };

  // Provide fallback responses that include correct account information
  const getFallbackResponse = (userMessage: string) => {
    const query = userMessage.toLowerCase();

    if (
      query.includes("account") ||
      query.includes("sign up") ||
      query.includes("register")
    ) {
      return "Important: Students don't need to create accounts to attend workshops! Only workshop organizers need accounts. Students can register directly for any workshop using the registration form.";
    } else if (query.includes("workshop") || query.includes("class")) {
      return `Here are the available workshops: ${getWorkshopInfo()} Students can register directly without creating an account.`;
    } else if (
      query.includes("organizer") ||
      query.includes("create workshop")
    ) {
      return "Workshop organizers need to create an account to manage their workshops. After creating an account, you can set up workshops, track registrations, and manage attendance.";
    } else {
      return "Smart Enroll makes workshop management easy. Workshop organizers create accounts to set up workshops, while students can register directly without creating accounts. How else can I help you?";
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    const userMessage = input;
    setInput("");
    setIsLoading(true);

    try {
      // Get response from our server API
      const response = await askAssistant(userMessage);

      // Add response to messages
      setMessages((prev) => [...prev, { role: "bot", content: response }]);
    } catch (error) {
      console.error("Error handling message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: getFallbackResponse(userMessage),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="border rounded-xl overflow-hidden">
      <div className="bg-gray-50 p-4 border-b">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-black" />
          <h3 className="font-medium">Smart Enroll Assistant</h3>
        </div>
      </div>

      <div
        className="h-[400px] overflow-y-auto p-4 space-y-4"
        ref={chatContainerRef}
      >
        {messages.map((message, i) => (
          <div
            key={i}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                message.role === "user" ? "bg-black text-white" : "bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {message.role === "user" ? (
                  <>
                    <User className="h-4 w-4" />
                    <span className="text-xs font-medium">You</span>
                  </>
                ) : (
                  <>
                    <Bot className="h-4 w-4" />
                    <span className="text-xs font-medium">Smart Enroll</span>
                  </>
                )}
              </div>
              <p className="whitespace-pre-line">{message.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl px-4 py-2 bg-gray-100">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                <div className="flex gap-1">
                  <span className="animate-bounce">●</span>
                  <span className="animate-bounce delay-100">●</span>
                  <span className="animate-bounce delay-200">●</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Ask about workshops or registration..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-black text-white hover:bg-gray-800"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
