"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Lightbulb,
  Plus,
  Loader2,
  Sparkles,
  MessageSquarePlus,
} from "lucide-react";
import { FormField, FieldType, FieldOption } from "@/lib/componentprops";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { v4 as uuidv4 } from "uuid";

interface AIFieldGeneratorProps {
  workshopData: {
    title?: string;
    description?: string;
    category?: string;
    level?: string;
    isFree?: boolean;
    capacity?: number;
  };
  formFields: FormField[];
  onAddField: (field: FormField) => void;
}

export default function AIFieldGenerator({
  workshopData,
  formFields,
  onAddField,
}: AIFieldGeneratorProps) {
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [generatedFields, setGeneratedFields] = useState<FormField[]>([]);
  const [error, setError] = useState<string | null>(null);

  const generateField = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a request for field generation");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-form-field", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          workshopData,
          existingFields: formFields.map((field) => ({
            type: field.type,
            label: field.label,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.fields || data.fields.length === 0) {
        throw new Error("No fields were generated");
      }

      // Process the generated fields to ensure they have all required properties
      const processedFields = data.fields.map((field: any) => {
        return {
          id: `field_${uuidv4()}`,
          type: field.type as FieldType,
          label: field.label,
          placeholder:
            field.placeholder || `Enter your ${field.label.toLowerCase()}`,
          required: field.required || false,
          description: field.description || "",
          options: field.options || undefined,
        };
      });

      setGeneratedFields(processedFields);
      toast.success("Fields generated successfully!");
    } catch (error) {
      console.error("Error generating fields:", error);
      setError(
        error instanceof Error ? error.message : "Failed to generate fields"
      );
      toast.error("Failed to generate fields");
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = (field: FormField) => {
    onAddField(field);
    // Keep the field in the list but mark it as added
    setGeneratedFields((prev) =>
      prev.map((f) => (f.id === field.id ? { ...f, added: true } : f))
    );
    toast.success(`Added field: ${field.label}`);
  };

  const getExamplePrompts = () => [
    "Generate a field to collect student's education level with options from Level 100 to 400",
    "Create a checkbox list for dietary restrictions",
    "I need a text area for special accommodation requests",
    "Make a select field for t-shirt sizes with Small, Medium, Large options",
  ];

  return (
    <div className="space-y-4 mt-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-medium">AI Field Generator</h3>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Describe the form field you need and our AI will generate it. Be
                specific about field type, options, and requirements.
              </p>
              <Textarea
                placeholder="E.g., Generate a field to collect student's education level with options Level 100, 200, 300, 400 and Other"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="flex justify-end">
              <Button
                onClick={generateField}
                disabled={loading || !prompt.trim()}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <MessageSquarePlus className="h-4 w-4" />
                    Generate Field
                  </>
                )}
              </Button>
            </div>

            {/* Example prompts */}
            <div className="pt-2">
              <p className="text-xs text-muted-foreground mb-2">
                Try these examples:
              </p>
              <div className="flex flex-wrap gap-2">
                {getExamplePrompts().map((examplePrompt, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => setPrompt(examplePrompt)}
                  >
                    {examplePrompt.length > 40
                      ? examplePrompt.substring(0, 38) + "..."
                      : examplePrompt}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generated fields */}
      {generatedFields.length > 0 && (
        <div className="space-y-3 mt-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            <h4 className="font-medium">Generated Fields</h4>
          </div>

          <div className="space-y-2 border rounded-md p-4">
            {generatedFields.map((field) => (
              <div key={field.id} className={`p-3 border rounded-md `}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{field.label}</span>
                      {field.required && (
                        <span className="text-red-500 text-sm">*</span>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {field.type}
                      </Badge>
                    </div>

                    {field.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {field.description}
                      </p>
                    )}

                    {field.options && field.options.length > 0 && (
                      <div className="mt-1">
                        <p className="text-xs font-medium">Options:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {field.options.map((option, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="text-xs"
                            >
                              {typeof option === "string"
                                ? option
                                : option.label || option.value}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleAddField(field)}
                    className="flex items-center gap-1"
                  >
                    {
                      <>
                        <Plus className="h-3 w-3" /> Add
                      </>
                    }
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <div className="text-sm text-red-500 mt-2">Error: {error}</div>}
    </div>
  );
}
