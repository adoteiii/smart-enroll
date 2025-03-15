"use client"

import type React from "react"

import { use, useEffect, useState } from "react"
import { Bot, Send, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAppSelector } from "@/redux/store"
import dayjs from "dayjs"
import { Message } from "@/lib/types"
import { writeToDoc } from "@/lib/firebase/firestore"
import { v4 } from "uuid"



export default function AIAssistantPage() {
  const [input, setInput] = useState("")
  const dbuser = useAppSelector(state=>state.DBUserReducer.value)
  const servermessages = useAppSelector(state=>state.MessagesReducer.value)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      timestamp: dayjs().valueOf(),
      uid: dbuser?.uid||"",
      content:
        "Hello! I'm your AI workshop assistant. You can ask me questions about your workshops, registrations, or for insights about your data. How can I help you today?",
    },
  ])

  useEffect(()=>{
    if(servermessages){
      setMessages(servermessages)
    }
  }, [servermessages])

  const handleSend = () => {
    if (!dbuser?.uid) return
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      role: "user",
      uid: dbuser?.uid||"",
      content: input,
      timestamp: dayjs().valueOf()
    }
    writeToDoc("messages", v4(), userMessage)
    // setMessages((prev) => [...prev, userMessage])
    setInput("")

    // Simulate AI response
    setTimeout(() => {
      let response = ""

      if (input.toLowerCase().includes("most popular")) {
        response =
          "Based on current registration data, 'Advanced React Patterns' is your most popular workshop with 45 registrations (90% of capacity). It's followed by 'Data Science Fundamentals' with 32 registrations (80% of capacity)."
      } else if (input.toLowerCase().includes("registration")) {
        response =
          "You have a total of 1,248 registrations across all workshops. There's been a 12% increase in registrations compared to last month."
      } else if (input.toLowerCase().includes("upcoming")) {
        response =
          "You have 4 upcoming workshops in the next 2 weeks:\n- Advanced React Patterns (Mar 15)\n- Data Science Fundamentals (Mar 18)\n- UX Design Workshop (Mar 22)\n- Cloud Computing Essentials (Mar 25)"
      } else {
        response =
          "I can provide insights about your workshops, registration trends, and attendee data. Try asking about your most popular workshops, upcoming events, or registration statistics."
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: response,
        timestamp: dayjs().valueOf(),
        uid: dbuser?.uid||"",
      }
      writeToDoc("messages", v4(), assistantMessage)
      // setMessages((prev) => [...prev, assistantMessage])
    }, 1000)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-[100vw] overflow-hidden">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
        <p className="text-muted-foreground">Ask questions about your workshops and get AI-powered insights.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 w-full">
        <div className="md:col-span-2">
          <Card className="h-[calc(100vh-13rem)]">
            <CardHeader>
              <CardTitle>Workshop Assistant</CardTitle>
              <CardDescription>Ask questions about your workshops, registrations, and more.</CardDescription>
            </CardHeader>
            <CardContent className="h-[calc(75vh-9.5rem)] overflow-y-auto pb-0">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex  max-w-[80vw] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                      message.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {message.role === "assistant" ? (
                        <Avatar className="h-6 w-6">
                          <AvatarImage src="/placeholder.svg?height=24&width=24" alt="AI" />
                          <AvatarFallback>
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <Avatar className="h-6 w-6">
                          <AvatarImage src="/placeholder.svg?height=24&width=24" alt="User" />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <span className="text-xs font-medium">{message.role === "user" ? "You" : "AI Assistant"}</span>
                    </div>
                    <div className="whitespace-pre-line">{message.content}</div>
                  </div>
                ))}
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
                />
                <Button size="icon" onClick={handleSend}>
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
              <CardDescription>Try asking these questions to get started.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start text-left text-wrap py-8"
                  onClick={() => {
                    setInput("What's my most popular workshop?")
                  }}
                >
                  What's my most popular workshop?
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left text-wrap py-8"
                  onClick={() => {
                    setInput("How many registrations do I have in total?")
                  }}
                >
                  How many registrations do I have in total?
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left text-wrap py-8"
                  onClick={() => {
                    setInput("What are my upcoming workshops?")
                  }}
                >
                  What are my upcoming workshops?
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left text-wrap py-8"
                  onClick={() => {
                    setInput("Which day of the week has the most registrations?")
                  }}
                >
                  Which day of the week has the most registrations?
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left text-wrap py-8"
                  onClick={() => {
                    setInput("What's the attendance rate for my workshops?")
                  }}
                >
                  What's the attendance rate for my workshops?
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

