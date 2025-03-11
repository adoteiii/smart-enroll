"use client"

import { useState } from "react"
import { ArrowUpDown, Edit, MoreHorizontal, Trash, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function SpeakersPage() {
  const [open, setOpen] = useState(false)

  const speakers = [
    {
      id: 1,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      expertise: "React, JavaScript, Web Development",
      workshops: 5,
      status: "Active",
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "michael.chen@example.com",
      expertise: "Data Science, Machine Learning, Python",
      workshops: 3,
      status: "Active",
    },
    {
      id: 3,
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      expertise: "UX Design, UI, User Research",
      workshops: 2,
      status: "Active",
    },
    {
      id: 4,
      name: "David Lee",
      email: "david.lee@example.com",
      expertise: "Cloud Computing, AWS, DevOps",
      workshops: 1,
      status: "Active",
    },
    {
      id: 5,
      name: "Emily Wilson",
      email: "emily.wilson@example.com",
      expertise: "Machine Learning, AI Ethics",
      workshops: 0,
      status: "Pending",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Speakers</h1>
        <p className="text-muted-foreground">Manage speakers for your workshops.</p>
      </div>

      <div className="flex items-center justify-between">
        <Input placeholder="Search speakers..." className="w-[300px]" />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" /> Add Speaker
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Speaker</DialogTitle>
              <DialogDescription>Add a new speaker to your workshop platform.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Enter speaker's full name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter speaker's email" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expertise">Areas of Expertise</Label>
                <Input id="expertise" placeholder="e.g. React, JavaScript, Web Development" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" placeholder="Enter speaker's bio" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setOpen(false)}>Add Speaker</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Speakers</CardTitle>
          <CardDescription>View and manage speakers for your workshops.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">
                  <div className="flex items-center gap-1">
                    Speaker
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>Expertise</TableHead>
                <TableHead>Workshops</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {speakers.map((speaker) => (
                <TableRow key={speaker.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`/placeholder.svg?height=32&width=32`} alt={speaker.name} />
                        <AvatarFallback>{speaker.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{speaker.name}</span>
                        <span className="text-xs text-muted-foreground">{speaker.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{speaker.expertise}</TableCell>
                  <TableCell>{speaker.workshops}</TableCell>
                  <TableCell>
                    <Badge variant={speaker.status === "Active" ? "default" : "secondary"}>{speaker.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" /> Edit Speaker
                        </DropdownMenuItem>
                        <DropdownMenuItem>View Workshops</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash className="mr-2 h-4 w-4" /> Remove Speaker
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

