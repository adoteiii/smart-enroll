"use client"

import { useState } from "react"
import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

export function ApiSettings() {
  const [showApiKey, setShowApiKey] = useState(false)
  const apiKey = ""

  return (
    <Card>
      <CardHeader>
        <CardTitle>API & Webhooks</CardTitle>
        <CardDescription>Manage API keys and webhook integrations.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="api-key">API Key</Label>
          <div className="flex space-x-2">
            <Input
              id="api-key"
              type={showApiKey ? "text" : "password"}
              value={apiKey}
              readOnly
              className="font-mono"
            />
            <Button variant="outline" onClick={() => setShowApiKey(!showApiKey)}>
              {showApiKey ? "Hide" : "Reveal"}
            </Button>
            <Button variant="outline">Regenerate</Button>
          </div>
          <p className="text-xs text-muted-foreground">Use this key to authenticate API requests.</p>
        </div>
        <Separator />
        <div className="space-y-2">
          <Label htmlFor="webhook-url">Webhook URL</Label>
          <Input id="webhook-url" placeholder="https://your-app.com/webhook" className="font-mono" />
          <p className="text-xs text-muted-foreground">We'll send event notifications to this URL.</p>
        </div>
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Webhook Events</h3>
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="event-registration" className="flex-1">
                registration.created
              </Label>
              <Switch id="event-registration" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="event-workshop" className="flex-1">
                workshop.created
              </Label>
              <Switch id="event-workshop" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="event-attendance" className="flex-1">
                attendance.marked
              </Label>
              <Switch id="event-attendance" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="event-feedback" className="flex-1">
                feedback.submitted
              </Label>
              <Switch id="event-feedback" />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button>
          <Save className="mr-2 h-4 w-4" /> Save API Settings
        </Button>
      </CardFooter>
    </Card>
  )
}