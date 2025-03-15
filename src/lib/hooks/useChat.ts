import { useState } from "react";
import { generateAIResponse } from "@/lib/gemini/chatClient";

export function useChat() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Send a message to the AI and get a response
   * @param message The user message
   * @param contextData Additional context data to provide to the AI
   * @returns The AI response
   */
  const sendMessage = async (
    message: string,
    contextData: any
  ): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await generateAIResponse(message, contextData);
      return response;
    } catch (err) {
      console.error("Error in AI chat:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendMessage,
    isLoading,
    error,
  };
}
