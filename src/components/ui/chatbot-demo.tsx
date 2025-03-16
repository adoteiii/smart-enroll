"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bot, Send, User, Sparkles, AlertCircle } from "lucide-react";
import { useAppSelector } from "@/redux/store";
import Image from "next/image";
import { cn } from "@/lib/utils";

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
  const [messageCount, setMessageCount] = useState(0);
  const [limitReached, setLimitReached] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);

  // Check for message limit on component mount
  useEffect(() => {
    const lastReset = localStorage.getItem("chatbot_last_reset");
    const storedMessageCount = localStorage.getItem("chatbot_message_count");

    if (lastReset && storedMessageCount) {
      const resetTime = parseInt(lastReset);
      const currentTime = Date.now();
      const elapsedMs = currentTime - resetTime;
      const hourInMs = 60 * 60 * 1000;

      if (elapsedMs < hourInMs) {
        // Timeout not expired yet
        setMessageCount(parseInt(storedMessageCount));
        if (parseInt(storedMessageCount) >= 3) {
          setLimitReached(true);
          const remainingMs = hourInMs - elapsedMs;
          const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
          setTimeRemaining(
            `${remainingMinutes} minute${remainingMinutes !== 1 ? "s" : ""}`
          );
        }
      } else {
        // Timeout expired, reset
        localStorage.setItem("chatbot_last_reset", currentTime.toString());
        localStorage.setItem("chatbot_message_count", "0");
        setMessageCount(0);
        setLimitReached(false);
      }
    } else {
      // First time using the chatbot
      localStorage.setItem("chatbot_last_reset", Date.now().toString());
      localStorage.setItem("chatbot_message_count", "0");
    }

    // Set up an interval to update the time remaining
    const interval = setInterval(() => {
      if (limitReached) {
        const lastReset = localStorage.getItem("chatbot_last_reset");
        if (lastReset) {
          const resetTime = parseInt(lastReset);
          const currentTime = Date.now();
          const elapsedMs = currentTime - resetTime;
          const hourInMs = 60 * 60 * 1000;

          if (elapsedMs >= hourInMs) {
            // Timeout expired
            localStorage.setItem("chatbot_last_reset", currentTime.toString());
            localStorage.setItem("chatbot_message_count", "0");
            setMessageCount(0);
            setLimitReached(false);
            setTimeRemaining(null);
          } else {
            // Update remaining time
            const remainingMs = hourInMs - elapsedMs;
            const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
            setTimeRemaining(
              `${remainingMinutes} minute${remainingMinutes !== 1 ? "s" : ""}`
            );
          }
        }
      }
    }, 60 * 1000); // Update every minute

    return () => clearInterval(interval);
  }, [limitReached]);

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

  const askAssistant = async (userMessage: string) => {
    try {
      const history =
        messages.length > 3
          ? messages.slice(-3)
          : messages.length > 1
          ? messages
          : [];

      // Call our API endpoint
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
    if (!input.trim() || limitReached) return;

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    const userMessage = input;
    setInput("");
    setIsLoading(true);

    // Update message count
    const newCount = messageCount + 1;
    setMessageCount(newCount);
    localStorage.setItem("chatbot_message_count", newCount.toString());

    // Check if limit reached
    if (newCount >= 3) {
      const currentTime = Date.now();
      localStorage.setItem("chatbot_last_reset", currentTime.toString());
      setLimitReached(true);
      setTimeRemaining("60 minutes");
    }

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
    <div className="relative">
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>

      <Card className="border-0 rounded-xl overflow-hidden bg-gradient-to-br from-white to-slate-50 backdrop-blur-sm">
        <div className="bg-gradient-to-r from-green-50 to-indigo-50 p-4 border-b border-slate-100 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-200/30 via-transparent to-transparent"></div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-glow-light">
              <Image
                src="/icon.svg"
                alt="Smart Enroll Icon"
                height={100}
                width={100}
                className="h-5 w-5 text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <Image
                src="/word.svg"
                alt=""
                height={100}
                width={100}
                className="h-5"
              />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-slate-600">
                {messageCount}/3 messages used
              </span>
              <Sparkles className="h-5 w-5 text-green-400 animate-pulse" />
            </div>
          </div>
        </div>

        <div
          className="h-[400px] overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50 to-white scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent"
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
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3 backdrop-blur-sm transition-all duration-300 animate-fade-in",
                  message.role === "user"
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-glow-light-sm"
                    : "bg-gradient-to-r from-slate-100 to-green-50 text-slate-800 border border-slate-200"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  {message.role === "user" ? (
                    <>
                      <div className="h-5 w-5 rounded-full bg-indigo-100/80 flex items-center justify-center">
                        <User className="h-3 w-3 text-green-600" />
                      </div>
                      <span className="text-xs font-medium text-indigo-50">
                        You
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="h-5 w-5 rounded-full flex items-center justify-center">
                        <Bot className="h-3 w-3 text-green-600" />
                      </div>
                      <span className="text-xs font-medium text-slate-600">
                        Smart Enroll
                      </span>
                    </>
                  )}
                </div>
                <p className="whitespace-pre-line text-sm">{message.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-gradient-to-r from-slate-100 to-green-50 text-slate-800 border border-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center">
                    <Bot className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="text-xs font-medium text-slate-600">
                    Smart Enroll
                  </span>
                </div>
                <div className="flex gap-1 py-1">
                  <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                  <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse delay-100"></span>
                  <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse delay-200"></span>
                </div>
              </div>
            </div>
          )}

          {limitReached && (
            <div className="flex justify-center">
              <div className="max-w-[90%] rounded-2xl px-4 py-3 bg-amber-50 text-amber-800 border border-amber-100">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span className="font-medium">Message limit reached</span>
                </div>
                <p className="text-sm">
                  You've used all 3 messages for now. Please try again in{" "}
                  {timeRemaining || "1 hour"}.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 p-4 bg-gradient-to-b from-slate-50 to-white">
          <div className="flex gap-2 relative">
            <Input
              placeholder={
                limitReached
                  ? "Message limit reached. Try again later."
                  : "Ask about workshops or registration..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={limitReached}
              className="flex-1 bg-white/80 border-slate-200 text-slate-800 placeholder:text-slate-400 focus-visible:ring-green-600 rounded-lg"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading || limitReached}
              className="bg-green-600 rounded-lg shadow-glow-light-sm transition-all duration-300"
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
          {!limitReached && (
            <div className="text-xs text-slate-500 mt-2">
              {3 - messageCount} message{3 - messageCount !== 1 ? "s" : ""}{" "}
              remaining
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
