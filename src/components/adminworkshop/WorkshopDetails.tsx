import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkshopComponentProps } from "@/lib/componentprops";

interface WorkshopDetailsProps {
  workshop: Partial<WorkshopComponentProps>;
  onChange: (field: string, value: any) => void;
  onSaveDraft: () => void;
  onContinue: () => void;
  speakers: Array<{ id: string; name: string }>;
  isEditing?: boolean;
}

export function WorkshopDetails({
  workshop,
  onChange,
  onSaveDraft,
  onContinue,
  isEditing = false,

  speakers = [],
}: WorkshopDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>
          Enter the core details about your workshop.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Workshop Title</Label>
          <Input
            id="title"
            placeholder="e.g. Advanced React Patterns"
            value={workshop.title || ""}
            onChange={(e) => onChange("title", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe what students will learn in this workshop..."
            className="min-h-32"
            value={workshop.description || ""}
            onChange={(e) => onChange("description", e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={(workshop.category as string) || ""}
              onValueChange={(value) => onChange("category", value)}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="programming">Programming</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="data-science">Data Science</SelectItem>
                <SelectItem value="cloud">Cloud Computing</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="level">Difficulty Level</Label>
            <Select
              value={(workshop.level as string) || ""}
              onValueChange={(value) => onChange("level", value)}
            >
              <SelectTrigger id="level">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="speaker">Speaker</Label>
          <Select
            value={workshop.speaker?.docID || ""}
            onValueChange={(speakerId) => {
              const selectedSpeaker = speakers.find((s) => s.id === speakerId);
              if (selectedSpeaker) {
                onChange("speaker", {
                  docID: selectedSpeaker.id,
                  name: selectedSpeaker.name,
                  // Include other required speaker fields with default values
                  bio: "",
                  email: "",
                  status: "active",
                  profileImage: "",
                  createdAt: "",
                  organizationId: "",
                  // These fields can be updated later when you have the actual values
                });
              }
            }}
          >
            <SelectTrigger id="speaker">
              <SelectValue placeholder="Select speaker" />
            </SelectTrigger>
            <SelectContent>
              {speakers.map((speaker) => (
                <SelectItem key={speaker.id} value={speaker.id}>
                  {speaker.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          {!isEditing && (
            <Button variant="outline" onClick={onSaveDraft}>
              Save as Draft
            </Button>
          )}
        </div>
        <Button onClick={onContinue}>Continue to Schedule</Button>
      </CardFooter>
    </Card>
  );
}
