import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Generative AI API
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export async function generateAIResponse(
  message: string,
  contextData: any
): Promise<string> {
  try {
    // Use Gemini Pro for chat capabilities
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Clean and prepare context data
    const cleanContextData = JSON.parse(JSON.stringify(contextData));
    const { workshops = [], registrations = [] } = cleanContextData;

    // Create a system prompt with context information
    const systemPrompt = `
      You are an AI assistant for Smart Enroll, a workshop management platform.
      You help administrators analyze their workshop data, understand trends, and get insights.
      
      Today's date: ${new Date().toLocaleDateString()}
      
      Workshop Information:
      - Total workshops: ${workshops.length}
      - Upcoming workshops: ${
        workshops.filter((w: any) => w.status === "upcoming").length
      }
      - Past workshops: ${
        workshops.filter((w: any) => w.status === "completed").length
      }
      - Total registrations: ${registrations.length}
      
      Be helpful, conversational, and analytics-focused. Provide specific insights from the data.
      When discussing statistics, include actual numbers from the provided workshop data.
      Keep responses concise but informative.
    `;

    // Prepare the context-aware user prompt
    const userPrompt = `
      Based on the following workshop and registration data, please respond to this question:
      "${message}"
      
      Workshop data:
      ${JSON.stringify(workshops, null, 2)}
      
      Registration data:
      ${JSON.stringify(registrations, null, 2)}
    `;

    // Send the request to Gemini
    const result = await model.generateContent([systemPrompt, userPrompt]);
    const response = result.response;
    const text = response.text();
    console.log('server queried prompt with', message, 'and sent response: ', text)
    return text;
  } catch (error) {
    console.error("Error generating AI response:", error);
    throw error;
  }
}
