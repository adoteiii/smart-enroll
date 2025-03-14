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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { WorkshopComponentProps } from "@/lib/componentprops";

interface WorkshopRegistrationProps {
  workshop: Partial<WorkshopComponentProps>;
  onChange: (field: string, value: any) => void;
  onPrevious: () => void;
  onContinue: () => void;
  isEditing?: boolean;
}

export function WorkshopRegistration({
  workshop,
  onChange,
  onPrevious,
  onContinue,
  isEditing = false,
}: WorkshopRegistrationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? "Edit Registration Settings" : "Registration Settings"}
        </CardTitle>
        <CardDescription>
          {isEditing
            ? "Update how participants will register for your workshop."
            : "Configure how participants will register for your workshop."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="capacity">Maximum Capacity</Label>
          <Input
            id="capacity"
            type="number"
            placeholder="e.g. 50"
            value={workshop.capacity || ""}
            onChange={(e) =>
              onChange("capacity", parseInt(e.target.value) || 0)
            }
          />
          <p className="text-xs text-muted-foreground">
            Set to 0 for unlimited capacity
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="approval-required">Require Approval</Label>
            <Switch
              id="approval-required"
              checked={workshop.requireApproval || false}
              onCheckedChange={(checked) =>
                onChange("requireApproval", checked)
              }
            />
          </div>
          <p className="text-xs text-muted-foreground">
            When enabled, registrations will require manual approval
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="waitlist">Enable Waitlist</Label>
            <Switch
              id="waitlist"
              checked={workshop.enableWaitlist || false}
              onCheckedChange={(checked) => onChange("enableWaitlist", checked)}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Allow students to join a waitlist when capacity is reached
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="is-free">Free Workshop</Label>
            <Switch
              id="is-free"
              checked={workshop.isFree || false}
              onCheckedChange={(checked) => {
                onChange("isFree", checked);
                if (checked) {
                  onChange("price", 0);
                }
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Toggle if this workshop is free or paid
          </p>
        </div>

        {!workshop.isFree && (
          <div className="space-y-2">
            <Label htmlFor="price">Workshop Price (GHS)</Label>
            <Input
              id="price"
              type="number"
              placeholder="e.g. 50.00"
              value={workshop.price || ""}
              onChange={(e) =>
                onChange("price", parseFloat(e.target.value) || 0)
              }
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="registration-close">Registration Closes</Label>
          <Select
            value={(workshop.registrationCloses as string) || ""}
            onValueChange={(value) => onChange("registrationCloses", value)}
          >
            <SelectTrigger id="registration-close">
              <SelectValue placeholder="Select when registration closes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="start">At workshop start time</SelectItem>
              <SelectItem value="1-day">1 day before</SelectItem>
              <SelectItem value="3-days">3 days before</SelectItem>
              <SelectItem value="1-week">1 week before</SelectItem>
              <SelectItem value="custom">Custom date</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button onClick={onContinue}>Continue to Publish</Button>
      </CardFooter>
    </Card>
  );
}
