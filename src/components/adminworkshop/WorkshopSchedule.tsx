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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { WorkshopComponentProps } from "@/lib/componentprops";

interface WorkshopScheduleProps {
  workshop: Partial<WorkshopComponentProps>;
  onChange: (field: string, value: any) => void;
  onPrevious: () => void;
  onContinue: () => void;
  isEditing?: boolean;
}

export function WorkshopSchedule({
  workshop,
  onChange,
  onPrevious,
  onContinue,
  isEditing = false,
}: WorkshopScheduleProps) {
  // Times for the dropdown
  const times = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return {
      value: `${hour}:00`,
      label: `${displayHour}:00 ${period}`,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? "Edit Workshop Schedule" : "Workshop Schedule"}
        </CardTitle>
        <CardDescription>
          {isEditing
            ? "Update the date, time, and duration of your workshop."
            : "Set the date, time, and duration of your workshop."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Workshop Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !workshop.startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {workshop.startDate
                  ? format(new Date(workshop.startDate), "PPP")
                  : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={
                  workshop.startDate ? new Date(workshop.startDate) : undefined
                }
                onSelect={(date) => {
                  if (date) {
                    // Preserve the time component if it exists
                    const currentDate = workshop.startDate
                      ? new Date(workshop.startDate)
                      : new Date();
                    date.setHours(
                      currentDate.getHours(),
                      currentDate.getMinutes(),
                      0,
                      0
                    );
                    onChange("startDate", date.toISOString());
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="start-time">Start Time</Label>
            <Select
              value={
                workshop.startDate
                  ? format(new Date(workshop.startDate), "H:mm")
                  : ""
              }
              onValueChange={(time) => {
                if (workshop.startDate) {
                  const date = new Date(workshop.startDate);
                  const [hours, minutes] = time.split(":").map(Number);
                  date.setHours(hours, minutes, 0, 0);
                  onChange("startDate", date.toISOString());
                } else {
                  // If no date is set, use today
                  const date = new Date();
                  const [hours, minutes] = time.split(":").map(Number);
                  date.setHours(hours, minutes, 0, 0);
                  onChange("startDate", date.toISOString());
                }
              }}
            >
              <SelectTrigger id="start-time">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {times.map((time) => (
                  <SelectItem key={time.value} value={time.value}>
                    {time.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-time">End Time</Label>
            <Select
              value={
                workshop.endDate
                  ? format(new Date(workshop.endDate), "H:mm")
                  : ""
              }
              onValueChange={(time) => {
                // Use the start date as a base for consistency
                const baseDate = workshop.startDate
                  ? new Date(workshop.startDate)
                  : new Date();

                const [hours, minutes] = time.split(":").map(Number);
                const date = new Date(baseDate);
                date.setHours(hours, minutes, 0, 0);

                // If end time is before start time, assume it's the next day
                if (workshop.startDate && date < new Date(workshop.startDate)) {
                  date.setDate(date.getDate() + 1);
                }

                onChange("endDate", date.toISOString());
              }}
            >
              <SelectTrigger id="end-time">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {times.map((time) => (
                  <SelectItem key={time.value} value={time.value}>
                    {time.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Select
            value={workshop.location || ""}
            onValueChange={(value) => onChange("location", value)}
          >
            <SelectTrigger id="location">
              <SelectValue placeholder="Select location type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="online">Online (Virtual)</SelectItem>
              <SelectItem value="in-person">In-Person</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button onClick={onContinue}>Continue to Registration</Button>
      </CardFooter>
    </Card>
  );
}
