import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history, workshopInfo } = body;

    // Using history directly as a parameter instead of creating a chat
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Prepare the prompt with context
    const prompt = `
You are a helpful assistant for Smart Enroll, a workshop management platform.

ABOUT SMART ENROLL:
- Smart Enroll helps organizations create and manage workshops, registrations, and attendance
- Key features include workshop creation, automated notifications, analytics, and role-based permissions
- There are different pricing tiers: Free (up to 100 registrations), Business ($99/month for unlimited), and Enterprise (custom)

WORKSHOP INFORMATION:
${workshopInfo}

IMPORTANT GUIDELINES:
- Only provide information about Smart Enroll features, how to use the platform, and general workshop details
- When discussing workshops, only mention titles, categories, and levels - no participant information
- Never provide specific registration counts, personal data, or sensitive information
- Always be helpful regarding how to register for workshops or sign up as an organization
- Explain the role management system when asked (Admin, Organization Admin, Instructor, Participant roles)

User question: ${message}

Keep your response clear, professional, and focused on helping users understand the Smart Enroll platform.`;

    // Use previous messages as context if available
    let contextText = "";
    if (history && history.length > 0) {
      contextText = "Previous conversation:\n";
      history.forEach((item: any) => {
        if (item.role === "user") {
          contextText += `User: ${item.content}\n`;
        } else {
          contextText += `Assistant: ${item.content}\n`;
        }
      });
      contextText += "\n";
    }

    // Generate content with combined context
    const result = await model.generateContent(contextText + prompt);
    const response = result.response.text();

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error("Error generating response:", error);
    return NextResponse.json(
      {
        response:
          "I'm sorry, I encountered an error processing your request. Please try again.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
