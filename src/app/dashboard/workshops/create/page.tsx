"use client"

import { useState } from "react"
import Link from "next/link"
import { CalendarIcon, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"

export default function CreateWorkshopPage() {
  const [date, setDate] = useState<Date>()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/workshops">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Workshop</h1>
          <p className="text-muted-foreground">Set up a new workshop event for students to register.</p>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Workshop Details</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="registration">Registration</TabsTrigger>
          <TabsTrigger value="publish">Publish</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the core details about your workshop.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Workshop Title</Label>
                <Input id="title" placeholder="e.g. Advanced React Patterns" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what students will learn in this workshop..."
                  className="min-h-32"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select>
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
                  <Select>
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
                <Select>
                  <SelectTrigger id="speaker">
                    <SelectValue placeholder="Select speaker" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jane-smith">Jane Smith</SelectItem>
                    <SelectItem value="michael-chen">Michael Chen</SelectItem>
                    <SelectItem value="sarah-johnson">Sarah Johnson</SelectItem>
                    <SelectItem value="david-lee">David Lee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Save as Draft</Button>
              <Button>Continue to Schedule</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Workshop Schedule</CardTitle>
              <CardDescription>Set the date, time, and duration of your workshop.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Workshop Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start-time">Start Time</Label>
                  <Select>
                    <SelectTrigger id="start-time">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9:00">9:00 AM</SelectItem>
                      <SelectItem value="10:00">10:00 AM</SelectItem>
                      <SelectItem value="11:00">11:00 AM</SelectItem>
                      <SelectItem value="12:00">12:00 PM</SelectItem>
                      <SelectItem value="13:00">1:00 PM</SelectItem>
                      <SelectItem value="14:00">2:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-time">End Time</Label>
                  <Select>
                    <SelectTrigger id="end-time">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="11:00">11:00 AM</SelectItem>
                      <SelectItem value="12:00">12:00 PM</SelectItem>
                      <SelectItem value="13:00">1:00 PM</SelectItem>
                      <SelectItem value="14:00">2:00 PM</SelectItem>
                      <SelectItem value="15:00">3:00 PM</SelectItem>
                      <SelectItem value="16:00">4:00 PM</SelectItem>
                      <SelectItem value="17:00">5:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="utc-8">
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc-8">Pacific Time (UTC-8)</SelectItem>
                    <SelectItem value="utc-5">Eastern Time (UTC-5)</SelectItem>
                    <SelectItem value="utc+0">UTC</SelectItem>
                    <SelectItem value="utc+1">Central European Time (UTC+1)</SelectItem>
                    <SelectItem value="utc+8">China Standard Time (UTC+8)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select>
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
              <Button variant="outline">Previous</Button>
              <Button>Continue to Registration</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="registration">
          <Card>
            <CardHeader>
              <CardTitle>Registration Settings</CardTitle>
              <CardDescription>Configure how students can register for your workshop.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="capacity">Maximum Capacity</Label>
                <Input id="capacity" type="number" placeholder="e.g. 50" />
                <p className="text-xs text-muted-foreground">Set to 0 for unlimited capacity</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="approval-required">Require Approval</Label>
                  <Switch id="approval-required" />
                </div>
                <p className="text-xs text-muted-foreground">
                  When enabled, registrations will require manual approval
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="waitlist">Enable Waitlist</Label>
                  <Switch id="waitlist" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Allow students to join a waitlist when capacity is reached
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="registration-close">Registration Closes</Label>
                <Select>
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
              <Button variant="outline">Previous</Button>
              <Button>Continue to Publish</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="publish">
          <Card>
            <CardHeader>
              <CardTitle>Publish Workshop</CardTitle>
              <CardDescription>Review your workshop details and publish when ready.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="publish-now">Publish Immediately</Label>
                  <Switch id="publish-now" defaultChecked />
                </div>
                <p className="text-xs text-muted-foreground">
                  When enabled, the workshop will be visible to students immediately
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="send-notifications">Send Notifications</Label>
                  <Switch id="send-notifications" defaultChecked />
                </div>
                <p className="text-xs text-muted-foreground">Notify subscribers about this new workshop</p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="font-medium">Workshop Summary</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Please review all details before publishing. Once published, students will be able to register for
                  this workshop.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Save as Draft</Button>
              <Button>Publish Workshop</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

