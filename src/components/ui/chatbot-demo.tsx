"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Bot, Send, User } from "lucide-react"

export default function ChatbotDemo() {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content:
        "Hello! I'm your AI workshop assistant. How can I help your organization today? You can ask about setting up workshops, managing registrations, or analytics features.",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = () => {
    if (!input.trim()) return

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: input }])
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      let response = ""

      if (input.toLowerCase().includes("pricing") || input.toLowerCase().includes("cost")) {
        response =
          "Our pricing is designed to be flexible for organizations of all sizes:\n\n• Free Tier: Up to 100 registrations per event with basic features\n• Business Plan ($99/month): Unlimited registrations with full AI features\n• Enterprise: Custom pricing with API access and white-labeling\n\nWould you like to schedule a demo to see which plan fits your needs?"
      } else if (input.toLowerCase().includes("analytics") || input.toLowerCase().includes("dashboard")) {
        response =
          "Our analytics dashboard provides real-time insights for your organization:\n\n• Track registration and attendance rates\n• Monitor engagement across different workshops\n• Identify trends and patterns to optimize future events\n• Generate custom reports for stakeholders\n\nThe dashboard is fully customizable to focus on the metrics that matter most to your organization."
      } else if (input.toLowerCase().includes("setup") || input.toLowerCase().includes("start")) {
        response =
          "Getting started is simple:\n\n1. Create your organization account\n2. Set up your first event or workshop series\n3. Customize your registration forms with your branding\n4. Invite participants via email or shareable link\n\nOur AI will then help manage registrations, send reminders, and provide analytics. Would you like me to guide you through the setup  send reminders, and provide analytics. Would you like me to guide you through the setup process?"
      } else if (input.toLowerCase().includes("chatbot") || input.toLowerCase().includes("ai assistant")) {
        response =
          "Our AI chatbot provides 24/7 support for both administrators and participants:\n\n• For administrators: Help with event setup, scheduling, and analytics interpretation\n• For participants: Workshop recommendations, registration assistance, and FAQs\n\nThe chatbot learns from interactions to continuously improve its responses and can be customized with your organization's specific information and policies."
      } else {
        response =
          "I'd be happy to help your organization with workshop management. Our platform helps streamline the entire process from registration to follow-up:\n\n• Reduce administrative workload by up to 75%\n• Increase attendance rates with AI-powered reminders\n• Gain valuable insights through our analytics dashboard\n\nWhat specific aspect of workshop management is your organization looking to improve?"
      }

      setMessages((prev) => [...prev, { role: "bot", content: response }])
      setIsLoading(false)
      setInput("")
    }, 1500)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Card className="border rounded-xl overflow-hidden">
      <div className="bg-gray-50 p-4 border-b">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-black" />
          <h3 className="font-medium">Business AI Assistant</h3>
        </div>
      </div>

      <div className="h-[400px] overflow-y-auto p-4 space-y-4">
        {messages.map((message, i) => (
          <div key={i} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
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
                    <span className="text-xs font-medium">AI Assistant</span>
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
            placeholder="Ask about features, pricing, or getting started..."
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
  )
}

