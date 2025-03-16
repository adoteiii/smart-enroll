"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play } from "lucide-react";
import ChatbotDemo from "@/components/ui/chatbot-demo";

export default function AIShowcase() {
  return (
    <section className=" px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold">See AI in Action</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Experience how Smart-Enroll transforms workshop management for
            organizations
          </p>
        </div>

        <div className="mt-12">
          <Tabs defaultValue="chatbot" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="chatbot">AI Chatbot</TabsTrigger>
              <TabsTrigger value="registration">Registration</TabsTrigger>
            </TabsList>
            <TabsContent value="chatbot" className="mt-6">
              <div className="mx-auto max-w-2xl">
                <ChatbotDemo />
              </div>
            </TabsContent>
            <TabsContent value="registration" className="mt-6">
              <div className="mx-auto max-w-3xl aspect-video rounded-xl overflow-hidden border flex items-center justify-center bg-white">
                <div className="text-center">
                  <Play className="h-16 w-16 mx-auto text-black/30" />
                  <p className="mt-4 text-gray-600">
                    AI-assisted registration demo
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
