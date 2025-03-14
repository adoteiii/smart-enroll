import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { WorkshopComponentProps } from "@/lib/componentprops";
import { format } from "date-fns";

interface WorkshopPublishProps {
  workshop: Partial<WorkshopComponentProps>;
  onChange: (field: string, value: any) => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  onPrevious: () => void;
}

export function WorkshopPublish({ 
  workshop, 
  onChange, 
  onSaveDraft, 
  onPublish, 
  onPrevious 
}: WorkshopPublishProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Publish Workshop</CardTitle>
        <CardDescription>Review your workshop details and publish when ready.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="publish-now">Publish Immediately</Label>
            <Switch 
              id="publish-now" 
              defaultChecked 
              checked={workshop.status !== 'cancelled'}
              onCheckedChange={(checked) => {
                onChange('status', checked ? 'upcoming' : 'cancelled');
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            When enabled, the workshop will be visible to students immediately
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="send-notifications">Send Notifications</Label>
            <Switch 
              id="send-notifications" 
              defaultChecked 
              checked={workshop.sendNotifications || false}
              onCheckedChange={(checked) => onChange('sendNotifications', checked)}
            />
          </div>
          <p className="text-xs text-muted-foreground">Notify subscribers about this new workshop</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-medium">Workshop Summary</h3>
          <div className="mt-3 space-y-2 text-sm">
            {workshop.title && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Title:</span> 
                <span className="font-medium">{workshop.title}</span>
              </div>
            )}
            {workshop.startDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">{format(new Date(workshop.startDate), "PPP")}</span>
              </div>
            )}
            {workshop.startDate && workshop.endDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time:</span>
                <span className="font-medium">
                  {format(new Date(workshop.startDate), "h:mm a")} - {format(new Date(workshop.endDate), "h:mm a")}
                </span>
              </div>
            )}
            {workshop.location && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium">{workshop.location}</span>
              </div>
            )}
            {workshop.speaker?.name && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Speaker:</span>
                <span className="font-medium">{workshop.speaker.name}</span>
              </div>
            )}
            {workshop.capacity && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Capacity:</span>
                <span className="font-medium">{workshop.capacity} attendees</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price:</span>
              <span className="font-medium">
                {workshop.isFree ? "Free" : `GHS ${workshop.price || 0}`}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>Previous</Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onSaveDraft}>Save as Draft</Button>
          <Button onClick={onPublish}>Publish Workshop</Button>
        </div>
      </CardFooter>
    </Card>
  );
}