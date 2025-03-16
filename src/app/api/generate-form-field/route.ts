import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

export async function POST(request: Request) {
  try {
    const { prompt, workshopData, existingFields } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Create a prompt that defines how to generate form fields
    const contextPrompt = `
      You are an AI assistant specialized in creating form fields for workshop registration.
      Generate form fields based on the user's request. The fields should be relevant to the workshop context.
      
      Workshop information:
      - Title: ${workshopData.title || "N/A"}
      - Description: ${workshopData.description || "N/A"}
      - Category: ${workshopData.category || "N/A"}
      - Level: ${workshopData.level || "N/A"}
      - Is Free: ${workshopData.isFree ? "Yes" : "No"}
      - Capacity: ${workshopData.capacity || "N/A"}
      
      Existing fields in the form:
      ${existingFields
        .map((field: any) => `- ${field.label} (${field.type})`)
        .join("\n")}
      
      Please respond with JSON objects for each field with the following properties:
      - type: one of [text, email, phone, number, textarea, select, checkbox, radio, date]
      - label: the field label text
      - placeholder: placeholder text for the field
      - required: boolean indicating if the field is required
      - description: a helpful description for the field (optional)
      - options: array of string options (required for select, checkbox, radio types)
      
      User request: ${prompt}
      
      IMPORTANT: Respond ONLY with valid JSON that matches this format exactly:
      { 
        "fields": [
          {
            "type": "type_here",
            "label": "label_here",
            "placeholder": "placeholder_here",
            "required": true_or_false,
            "description": "description_here",
            "options": ["option1", "option2"] // only for select, checkbox, radio
          }
        ]
      }
      
      Your entire response must be valid JSON and nothing else.
    `;

    // Generate content with Gemini
    const result = await model.generateContent(contextPrompt);
    const content = result.response.text();

    // Parse the JSON response
    let fields;
    try {
      // Try to parse the JSON response
      fields = JSON.parse(content.trim());

      // Validate the response has the expected structure
      if (!fields.fields || !Array.isArray(fields.fields)) {
        throw new Error("Invalid response format: missing fields array");
      }

      // Validate each field has the required properties
      fields.fields.forEach((field: any, index: number) => {
        if (!field.type || !field.label) {
          throw new Error(
            `Invalid field at index ${index}: missing required properties`
          );
        }

        // Ensure options array exists for fields that require it
        if (
          ["select", "checkbox", "radio"].includes(field.type) &&
          (!field.options || !Array.isArray(field.options))
        ) {
          field.options = ["Option 1", "Option 2"]; // Provide default options
        }
      });
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      console.error("Parse error:", e);

      // Attempt to extract JSON if it's embedded in other text
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          fields = JSON.parse(jsonMatch[0]);
        } else {
          return NextResponse.json(
            { error: "Invalid response format from AI" },
            { status: 500 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: "Invalid response format from AI" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(fields);
  } catch (error) {
    console.error("Error generating form fields:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
