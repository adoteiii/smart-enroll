import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API client
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

export const genAI = new GoogleGenerativeAI(API_KEY);

export async function generateInsights(data: any, customPrompt?: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Clean the data to ensure it's in a format that can be stringified
    const cleanData = JSON.parse(JSON.stringify(data));

    // Use the custom prompt if provided, otherwise use the default prompt
    const prompt =
      customPrompt ||
      `
      You are an analytics expert for a workshop registration platform called Smart Enroll.
      
      Workshop admins collect various types of custom form data when people register for their workshops.
      This form data can vary significantly between workshops as each admin can customize their registration forms.
      
      Analyze the following workshop registration data, paying special attention to:
      1. Patterns in the registration form data fields that were collected
      2. Common responses in form fields across workshops
      3. Response rates and completion rates for different form fields
      4. Relationships between form field responses and workshop popularity/completion
      5. Any other insights that would help workshop administrators optimize their registration process
      
      Data:
      ${JSON.stringify(cleanData, null, 2)}
      
      Provide 4-5 actionable insights based on the data that would help workshop administrators improve their events.
      Format your response as a JSON array of insight objects with these properties:
      - category: One of: "form_optimization" | "attendee_insight" | "content_suggestion" | "process_improvement" | "engagement_opportunity"
      - title: A clear, specific insight title (5-7 words max)
      - description: A detailed 1-2 sentence explanation of the insight
      - actionItem: A specific action the workshop admin can take based on this insight
      - relevantFields: An array of 1-3 form fields that are most relevant to this insight
      - dataPoint: A key numerical finding that supports this insight (e.g. "75% completion rate")
      
      Only include insights that have strong support in the actual data.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("Error parsing Gemini response:", e);
      // Extract JSON from the text if it's wrapped in markdown code blocks
      const jsonMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1]);
      }
      throw new Error("Invalid response format from Gemini");
    }
  } catch (error) {
    console.error("Error generating insights:", error);
    throw error;
  }
}

// Helper function to generate dashboard summary stats
export async function generateSummaryStats(data: any) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const cleanData = JSON.parse(JSON.stringify(data));

    const prompt = `
      Based on this workshop registration form data:
      ${JSON.stringify(cleanData, null, 2)}
      
      Generate 3 key form insights that would be useful for a workshop administrator.
      Focus on practical, non-technical information about form fields, completion patterns, and attendee preferences.
      
      Format your response as a JSON array of insight objects with these properties:
      - title: A simple, clear statistic or finding (e.g. "Most Popular Field", "Quick Forms Win")
      - description: A brief explanation in friendly, non-technical language (max 15 words)
      - category: One of: "Form Design", "Attendee Preference", "Completion Pattern"
      
      Example:
      [
        {
          "title": "Quick Forms Win",
          "description": "Forms with 4-5 fields have 35% higher completion rates",
          "category": "Form Design"
        }
      ]
      
      Avoid technical language, implementation details, or references to data structures.
      Focus only on insights that would be immediately useful to a workshop organizer.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("Error parsing Gemini response:", e);
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1]);
      }
      throw new Error("Invalid response format from Gemini");
    }
  } catch (error) {
    console.error("Error generating summary stats:", error);
    throw error;
  }
}

export async function analyzeFormFields(data: any) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const cleanData = JSON.parse(JSON.stringify(data));

    const prompt = `
      As a data analyst for Smart Enroll, analyze the custom registration form fields used across workshops.
      
      Given this workshop registration data:
      ${JSON.stringify(cleanData, null, 2)}
      
      Generate a comprehensive analysis of the form fields that includes:
      
      1. The most effective form fields that correlate with high workshop completion rates
      2. Which fields have the highest and lowest completion rates
      3. Recommended field types and formats based on user response patterns
      4. Suggestions for new form fields that could provide valuable attendee insights
      
      Format your response as a JSON object with these properties:
      - effectiveFields: Array of objects {fieldName, completionRate, reason}
      - completionRates: Object showing {highestField, lowestField, averageRate}
      - recommendedFormats: Array of objects {fieldType, bestPractice, example}
      - suggestedNewFields: Array of objects {fieldName, purpose, expectedInsight}
      - optimalFormLength: Integer representing ideal number of form fields
      
      Ensure all insights are directly supported by patterns in the actual data provided.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("Error parsing Gemini response:", e);
      const jsonMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1]);
      }
      throw new Error("Invalid response format from Gemini");
    }
  } catch (error) {
    console.error("Error analyzing form fields:", error);
    throw error;
  }
}

export async function generateRegistrationTrends(data: any) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const cleanData = JSON.parse(JSON.stringify(data));

    const prompt = `
      As a workshop analytics specialist, analyze this registration data to identify registration timing patterns:
      
      ${JSON.stringify(cleanData, null, 2)}
      
      Focus on:
      1. How far in advance people typically register for workshops
      2. What days of the week and times of day are most popular for registrations
      3. Any correlations between registration timing and workshop completion/attendance
      4. How different workshop topics affect registration timing
      
      Format your response as a JSON object with these properties:
      - optimalNoticeWindow: Object {days: number, explanation: string}
      - peakRegistrationTimes: Array of objects {dayOrTime: string, percentage: number}
      - earlyVsLateRegistrationEffects: Object {earlyRegistrantCompletion: string, lateRegistrantCompletion: string, insight: string}
      - topicTimingCorrelations: Array of objects {topic: string, registrationPattern: string}
      - recommendedAnnouncementSchedule: Object {daysBeforeEvent: number, dayOfWeek: string, reasonForTiming: string}
      
      Base all insights on clear patterns in the actual data provided.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("Error parsing Gemini response:", e);
      const jsonMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1]);
      }
      throw new Error("Invalid response format from Gemini");
    }
  } catch (error) {
    console.error("Error generating registration trends:", error);
    throw error;
  }
}

export async function generateFormRecommendations(data: any) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const cleanData = JSON.parse(JSON.stringify(data));

    const prompt = `
      As a form design expert for Smart Enroll's workshop registration platform, suggest 3-5 additional form fields that would be valuable for a workshop registration form.
      
      Current form fields:
      ${JSON.stringify(cleanData.existingFields || [], null, 2)}
      
      Provide suggestions for practical form fields that workshop administrators can add to their registration form.
      Each suggestion should be something directly relevant to workshop registration.
      Workshops are for students so consider that.
      
      Format your response as a JSON array of field objects with these properties:
      - title: A short name for this suggestion (e.g., "Add Phone Number Field")
      - description: A brief explanation of why this field is useful
      - label: The actual field label that will appear on the form
      - type: One of: "text", "email", "select", "radio", "checkbox", "textarea", "tel", "date"
      - placeholder: A helpful placeholder text
      - required: Boolean - should be false by default
      - options: Array of strings (only for select, radio, checkbox fields)
      
      Example:
      [
        {
          "title": "Add Dietary Preferences",
          "description": "Important if your workshop includes meals or refreshments",
          "label": "Dietary Preferences",
          "type": "select",
          "placeholder": "Select your dietary preference",
          "required": false,
          "options": ["No Restrictions", "Vegetarian", "Vegan", "Gluten-Free", "Other"]
        }
      ]
      
      Be creative and relevant. Avoid suggesting fields that are already included in the current form.
      Focus on fields that will collect valuable information for workshop organizers.
      Never suggest phone number, email and name since they are alredy collected.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("Error parsing Gemini response:", e);
      const jsonMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1]);
      }
      throw new Error("Invalid response format from Gemini");
    }
  } catch (error) {
    console.error("Error generating form recommendations:", error);
    throw error;
  }
}

export async function generateEarlyStageRecommendations(data: any) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const cleanData = JSON.parse(JSON.stringify(data));

    const prompt = `
      As a workshop registration expert for Smart Enroll, you're helping workshop admins who have limited registration data.
      
      Analyze this early-stage workshop data:
      ${JSON.stringify(cleanData, null, 2)}
      
      Even though the data is limited, provide 3-4 insights and recommendations based on the actual data available.
      If you see any patterns in the limited data, mention those specifically.
      
      Focus on:
      1. Any patterns you can observe with the existing form fields and their completion rates
      2. Insights about which fields are working well vs. which ones need improvement
      3. Specific suggestions for the existing form fields based on their current performance
      4. How to build on what's working in their current forms to get better insights
      
      Format your response as a JSON array of insight objects with these properties:
      - category: One of: "form_completion" | "response_patterns" | "form_design" | "suggestion"
      - title: A short, clear title for the insight
      - description: A detailed 1-2 sentence explanation that references their actual data
      - actionItem: A specific action the workshop admin can take based on this insight
      
      For example, if you notice that one of their fields has a higher completion rate than others, highlight that.
      
      Balance your response with both observations about their current data AND recommendations for improvement.
      Use friendly, encouraging language that acknowledges they have some valuable data already.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("Error parsing Gemini response:", e);
      const jsonMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1]);
      }
      throw new Error("Invalid response format from Gemini");
    }
  } catch (error) {
    console.error("Error generating early stage recommendations:", error);
    throw error;
  }
}
