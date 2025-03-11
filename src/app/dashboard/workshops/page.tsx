import Link from "next/link"
import { ArrowUpDown, Calendar, Clock, Copy, Edit, Eye, MoreHorizontal, Plus, Trash, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function WorkshopsPage() {
  const workshops = [
    {
      id: 1,
      title: "Advanced React Patterns",
      date: "Mar 15, 2025",
      time: "10:00 AM - 2:00 PM",
      speaker: "Jane Smith",
      attendees: 45,
      capacity: 50,
      status: "Published",
    },
    {
      id: 2,
      title: "Data Science Fundamentals",
      date: "Mar 18, 2025",
      time: "1:00 PM - 5:00 PM",
      speaker: "Michael Chen",
      attendees: 32,
      capacity: 40,
      status: "Published",
    },
    {
      id: 3,
      title: "UX Design Workshop",
      date: "Mar 22, 2025",
      time: "9:00 AM - 12:00 PM",
      speaker: "Sarah Johnson",
      attendees: 28,
      capacity: 30,
      status: "Published",
    },
    {
      id: 4,
      title: "Cloud Computing Essentials",
      date: "Mar 25, 2025",
      time: "2:00 PM - 6:00 PM",
      speaker: "David Lee",
      attendees: 15,
      capacity: 35,
      status: "Draft",
    },
    {
      id: 5,
      title: "Machine Learning Bootcamp",
      date: "Apr 2, 2025",
      time: "9:00 AM - 4:00 PM",
      speaker: "Emily Wilson",
      attendees: 0,
      capacity: 25,
      status: "Draft",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Workshops</h1>
        <p className="text-muted-foreground">Create, manage, and track all your workshop events.</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input placeholder="Search workshops..." className="w-[300px]" />
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button asChild>
          <Link href="/dashboard/workshops/create">
            <Plus className="mr-2 h-4 w-4" /> Create Workshop
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Workshops</CardTitle>
          <CardDescription>A list of all your workshops and their current status.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">
                  <div className="flex items-center gap-1">
                    Title
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Speaker</TableHead>
                <TableHead>Registrations</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workshops.map((workshop) => (
                <TableRow key={workshop.id}>
                  <TableCell className="font-medium">{workshop.title}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{workshop.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">{workshop.time}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{workshop.speaker}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>
                        {workshop.attendees}/{workshop.capacity}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={workshop.status === "Published" ? "default" : "secondary"}>{workshop.status}</Badge>
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
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" /> Edit Workshop
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" /> Copy Registration Link
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash className="mr-2 h-4 w-4" /> Delete Workshop
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

