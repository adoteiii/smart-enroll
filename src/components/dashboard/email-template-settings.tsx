"use client"

import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function EmailTemplateSettings() {
  return (
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
  )
}