"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, X, Plus, Check } from "lucide-react";
import { generateFormRecommendations } from "@/lib/gemini/client";
import { toast } from "sonner";

interface FormAssistantProps {
  formFields: any[];
  onAddField: (field: any) => void;
  workshopData?: {
    title?: string;
    description?: string;
    category?: string;
    level?: string;
    isFree?: boolean;
    capacity?: number;
  };
}

export function FormAssistant({
  formFields,
  onAddField,
  workshopData,
}: FormAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const previousWorkshopDataRef = useRef<string>("");

  const generateContextualSuggestions = (fields: any[]) => {
    const suggestions = [];

    // If it's a paid workshop
    if (workshopData?.isFree === false) {
      if (!fields.some((f) => f.label?.toLowerCase().includes("invoice"))) {
        suggestions.push({
          title: "Add Invoice Details",
          description:
            "Collect billing information for paid workshop registration",
          label: "Invoice Information",
          type: "textarea",
          placeholder:
            "Enter billing address and any special invoice requirements",
          required: true,
        });
      }
    }

    // If it's a technical/advanced level workshop
    if (
      workshopData?.level?.toLowerCase().includes("advanced") ||
      workshopData?.category?.toLowerCase().includes("technical")
    ) {
      suggestions.push({
        title: "Add Technical Background",
        description:
          "Understand participant's technical expertise and tools familiarity",
        label: "Technical Experience",
        type: "textarea",
        placeholder:
          "Describe your experience with relevant technologies/tools",
        required: false,
      });
    }

    // If workshop has limited capacity
    if (workshopData?.capacity && workshopData.capacity < 20) {
      suggestions.push({
        title: "Add Motivation",
        description: "Help select participants for limited capacity workshop",
        label: "Why do you want to join this workshop?",
        type: "textarea",
        placeholder: "Share your motivation for participating",
        required: true,
      });
    }

    // If workshop title/description mentions specific keywords
    const workshopContext =
      `${workshopData?.title} ${workshopData?.description}`.toLowerCase();

    if (
      workshopContext.includes("software") ||
      workshopContext.includes("coding")
    ) {
      suggestions.push({
        title: "Add Development Environment",
        description: "Ensure participants have the right setup",
        label: "Development Environment",
        type: "select",
        placeholder: "Select your primary operating system",
        required: false,
        options: ["Windows", "macOS", "Linux", "Other"],
      });
    }

    if (workshopContext.includes("design") || workshopContext.includes("art")) {
      suggestions.push({
        title: "Add Portfolio Link",
        description: "Allow participants to showcase relevant work",
        label: "Portfolio URL",
        type: "url",
        placeholder: "https://your-portfolio.com",
        required: false,
      });
    }

    return suggestions;
  };

  // Generate suggestions when component is opened or workshop data changes
  const generateSuggestions = async () => {
    if (!isOpen) return;

    setIsLoading(true);
    try {
      // Show contextual suggestions immediately while waiting for AI
      const immediateContextualSuggestions =
        generateContextualSuggestions(formFields);
      if (immediateContextualSuggestions.length > 0) {
        setSuggestions(immediateContextualSuggestions.slice(0, 3));
      } else {
        setSuggestions(getFallbackSuggestions(formFields));
      }

      // Only call the AI if we have meaningful workshop data
      if (
        workshopData?.title ||
        workshopData?.description ||
        workshopData?.category ||
        workshopData?.level
      ) {
        const data = {
          existingFields: formFields,
          fieldTypes: analyzeFieldTypes(formFields),
          workshopContext: workshopData,
        };

        const recommendations = await generateFormRecommendations(data);
        if (recommendations?.length > 0) {
          setSuggestions(recommendations.slice(0, 3));
        }
      }
    } catch (error) {
      console.error("Error generating form suggestions:", error);
      // Contextual suggestions are already showing
    } finally {
      setIsLoading(false);
    }
  };

  // Analyze current field types to inform recommendations
  const analyzeFieldTypes = (fields: any[]) => {
    const types: Record<string, number> = {};
    fields.forEach((field) => {
      const type = field.type || "text";
      types[type] = (types[type] || 0) + 1;
    });
    return types;
  };

  // Fallback suggestions in case the AI service fails
  const getFallbackSuggestions = (fields: any[]) => {
    const contextualSuggestions = generateContextualSuggestions(fields);

    const hasDropdown = fields.some((f) =>
      ["select", "dropdown"].includes(f.type)
    );
    const hasPhone = fields.some((f) =>
      f.label?.toLowerCase().includes("phone")
    );
    const hasAddress = fields.some((f) =>
      f.label?.toLowerCase().includes("address")
    );

    const defaultSuggestions = [];

    if (!hasDropdown) {
      defaultSuggestions.push({
        title: "Add Experience Level",
        description:
          "A dropdown to gauge participant experience levels helps tailor workshop content.",
        label: "Experience Level",
        type: "select",
        placeholder: "Select your experience level",
        required: false,
        options: ["Beginner", "Intermediate", "Advanced"],
      });
    }

    if (!hasPhone) {
      defaultSuggestions.push({
        title: "Add Phone Number",
        description:
          "Collecting phone numbers allows for SMS notifications and emergency contact.",
        label: "Phone Number",
        type: "tel",
        placeholder: "Enter your phone number",
        required: false,
      });
    }

    if (!hasAddress) {
      defaultSuggestions.push({
        title: "Add Dietary Preferences",
        description:
          "Important if your workshop includes meals or refreshments.",
        label: "Dietary Preferences",
        type: "select",
        placeholder: "Select your dietary preference",
        required: false,
        options: [
          "No Restrictions",
          "Vegetarian",
          "Vegan",
          "Gluten-Free",
          "Other",
        ],
      });
    }

    const allSuggestions = [...contextualSuggestions, ...defaultSuggestions];

    // Filter out existing fields
    const availableSuggestions = allSuggestions.filter(
      (suggestion) =>
        !fields.some(
          (existingField) =>
            existingField.label?.toLowerCase() ===
            suggestion.label.toLowerCase()
        )
    );

    return availableSuggestions.slice(0, 3);
  };

  // Add the suggested field to the form
  const handleAddField = (suggestion: any) => {
    // The suggestion object now has all the fields we need directly
    const newField = {
      id: `field_${Date.now()}`, // Add unique id
      label: suggestion.label,
      type: suggestion.type,
      required: suggestion.required || false,
      placeholder: suggestion.placeholder || `Enter ${suggestion.label}`,
      options: suggestion.options || [],
    };

    onAddField(newField);
    toast.success(`Added ${newField.label} field to form`);

    // Remove this suggestion
    setSuggestions(suggestions.filter((s) => s.title !== suggestion.title));
  };

  // Track when workshop data changes to trigger new suggestions
  useEffect(() => {
    // Stringify workshop data to compare changes
    const currentWorkshopDataString = JSON.stringify(workshopData);

    // Only regenerate suggestions if component is open AND workshop data changed
    if (
      isOpen &&
      currentWorkshopDataString !== previousWorkshopDataRef.current
    ) {
      generateSuggestions();
      previousWorkshopDataRef.current = currentWorkshopDataString;
    }
  }, [workshopData, isOpen]);

  // Initial load of suggestions when component is opened
  useEffect(() => {
    if (isOpen) {
      generateSuggestions();
      // Store current workshop data
      previousWorkshopDataRef.current = JSON.stringify(workshopData);
    }
  }, [isOpen]);

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-xs opacity-80 hover:opacity-100"
      >
        <Lightbulb className="h-3 w-3" />
        <span>Suggest fields</span>
      </Button>
    );
  }

  return (
    <Card className="mt-4 border border-dashed border-primary/50 bg-primary/5">
      <CardContent className="p-3">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-medium">AI Form Suggestions</h4>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        {isLoading ? (
          <div className="py-3 flex items-center justify-center">
            <div className="animate-pulse flex gap-2">
              <div className="h-2 w-2 bg-primary rounded-full"></div>
              <div className="h-2 w-2 bg-primary rounded-full animation-delay-200"></div>
              <div className="h-2 w-2 bg-primary rounded-full animation-delay-500"></div>
            </div>
          </div>
        ) : suggestions.length > 0 ? (
          <div className="space-y-2 py-1">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-background rounded-md p-2 text-xs"
              >
                <div>
                  <div className="font-medium">{suggestion.title}</div>
                  <div className="text-muted-foreground text-xs mt-0.5">
                    {suggestion.description}
                  </div>
                  <div className="mt-1">
                    <Badge variant="outline" className="text-[10px]">
                      {suggestion.type || "text"} field
                    </Badge>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 gap-1"
                  onClick={() => handleAddField(suggestion)}
                >
                  <Plus className="h-3 w-3" />
                  <span>Add</span>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground py-3 text-center">
            No additional field suggestions available.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
