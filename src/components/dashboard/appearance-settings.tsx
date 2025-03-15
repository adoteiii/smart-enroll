"use client"

import { Moon, Palette, Save, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

interface AppearanceSettingsProps {
  isDarkMode: boolean
  toggleDarkMode: () => void
}

export function AppearanceSettings({ isDarkMode, toggleDarkMode }: AppearanceSettingsProps) {
  return (
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
        
      </CardContent>
      <CardFooter>
        <Button>
          <Save className="mr-2 h-4 w-4" /> Save Preferences
        </Button>
      </CardFooter>
    </Card>
  )
}