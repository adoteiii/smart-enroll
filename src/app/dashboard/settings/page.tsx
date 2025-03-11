"use client"

import { useState } from "react"
import { Bell, Moon, Palette, Save, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="email">Email Templates</TabsTrigger>
          <TabsTrigger value="api">API & Webhooks</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Update your personal information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" defaultValue="Admin User" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="admin@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input id="title" defaultValue="Workshop Administrator" />
                </div>
              </CardContent>
              <CardFooter>
                <Button>
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
              </CardFooter>
            </Card>
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Organization</CardTitle>
                <CardDescription>Update your organization details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input id="org-name" defaultValue="Workshop Admin Inc." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" type="url" defaultValue="https://workshopadmin.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Contact Email</Label>
                  <Input id="contact-email" type="email" defaultValue="contact@workshopadmin.com" />
                </div>
              </CardContent>
              <CardFooter>
                <Button>
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel of your dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sun className="h-4 w-4" />
                    <Label htmlFor="theme-mode">Dark Mode</Label>
                    <Moon className="h-4 w-4" />
                  </div>
                  <Switch id="theme-mode" checked={isDarkMode} onCheckedChange={toggleDarkMode} />
                </div>
                <p className="text-xs text-muted-foreground">Toggle between light and dark mode.</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="primary-color">Primary Color</Label>
                <div className="flex items-center space-x-2">
                  <Palette className="h-4 w-4" />
                  <Select defaultValue="blue">
                    <SelectTrigger id="primary-color" className="w-[180px]">
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="red">Red</SelectItem>
                      <SelectItem value="orange">Orange</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground">Choose the primary color for your dashboard.</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="sidebar-position">Sidebar Position</Label>
                <Select defaultValue="left">
                  <SelectTrigger id="sidebar-position" className="w-[180px]">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Choose the position of the sidebar.</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Save className="mr-2 h-4 w-4" /> Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="notifications">
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
        </TabsContent>
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>Customize the email templates sent to students.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="template-registration">Registration Confirmation</Label>
                <Textarea
                  id="template-registration"
                  className="min-h-32 font-mono text-sm"
                  defaultValue={`Hi {{name}},

Thank you for registering for {{workshop_name}}!

Date: {{workshop_date}}
Time: {{workshop_time}}
Location: {{workshop_location}}

We look forward to seeing you there!

Best regards,
{{organization_name}} Team`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-reminder">Workshop Reminder</Label>
                <Textarea
                  id="template-reminder"
                  className="min-h-32 font-mono text-sm"
                  defaultValue={`Hi {{name}},

This is a friendly reminder that you are registered for {{workshop_name}} tomorrow.

Date: {{workshop_date}}
Time: {{workshop_time}}
Location: {{workshop_location}}

We look forward to seeing you there!

Best regards,
{{organization_name}} Team`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-footer">Email Footer</Label>
                <Textarea
                  id="email-footer"
                  className="min-h-20 font-mono text-sm"
                  defaultValue={`{{organization_name}}
{{organization_address}}
{{organization_website}}

To unsubscribe from these emails, click here: {{unsubscribe_link}}`}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Save className="mr-2 h-4 w-4" /> Save Templates
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="api">
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
                    type="password"
                    value="sk_live_51NzUBtKLj6IgYuGi3RvlwQnI9RzSBrDMX"
                    readOnly
                    className="font-mono"
                  />
                  <Button variant="outline">Reveal</Button>
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
        </TabsContent>
      </Tabs>
    </div>
  )
}

