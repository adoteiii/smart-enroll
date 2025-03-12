"use client"

import { Bell, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

export function NotificationSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Configure how and when you receive notifications.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <Label htmlFor="email-notifications">Email Notifications</Label>
            </div>
            <Switch id="email-notifications" defaultChecked />
          </div>
          <p className="text-xs text-muted-foreground">Receive email notifications for important events.</p>
        </div>
        <Separator />
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Notification Events</h3>
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="new-registration" className="flex-1">
                New Registration
              </Label>
              <Switch id="new-registration" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="workshop-reminder" className="flex-1">
                Workshop Reminder (24h before)
              </Label>
              <Switch id="workshop-reminder" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="capacity-alert" className="flex-1">
                Workshop Capacity Alert (80% full)
              </Label>
              <Switch id="capacity-alert" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="feedback-received" className="flex-1">
                Feedback Received
              </Label>
              <Switch id="feedback-received" defaultChecked />
            </div>
          </div>
        </div>
        <Separator />
        <div className="space-y-2">
          <Label htmlFor="notification-frequency">Notification Digest</Label>
          <Select defaultValue="realtime">
            <SelectTrigger id="notification-frequency" className="w-[180px]">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="realtime">Real-time</SelectItem>
              <SelectItem value="daily">Daily Digest</SelectItem>
              <SelectItem value="weekly">Weekly Digest</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Choose how frequently you want to receive notification digests.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button>
          <Save className="mr-2 h-4 w-4" /> Save Preferences
        </Button>
      </CardFooter>
    </Card>
  )
}