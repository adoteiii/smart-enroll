import { ArrowUpDown, Calendar, Check, Download, MoreHorizontal, Search, X } from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function RegistrationsPage() {
  const registrations = [
    {
      id: 1,
      name: "Alex Johnson",
      email: "alex.j@example.com",
      workshop: "Advanced React Patterns",
      date: "Mar 15, 2025",
      registeredOn: "Mar 1, 2025",
      status: "Confirmed",
    },
    {
      id: 2,
      name: "Samantha Lee",
      email: "sam.lee@example.com",
      workshop: "Data Science Fundamentals",
      date: "Mar 18, 2025",
      registeredOn: "Mar 2, 2025",
      status: "Pending",
    },
    {
      id: 3,
      name: "Michael Chen",
      email: "m.chen@example.com",
      workshop: "UX Design Workshop",
      date: "Mar 22, 2025",
      registeredOn: "Mar 3, 2025",
      status: "Confirmed",
    },
    {
      id: 4,
      name: "Emily Wilson",
      email: "e.wilson@example.com",
      workshop: "Cloud Computing Essentials",
      date: "Mar 25, 2025",
      registeredOn: "Mar 4, 2025",
      status: "Confirmed",
    },
    {
      id: 5,
      name: "David Kim",
      email: "d.kim@example.com",
      workshop: "Advanced React Patterns",
      date: "Mar 15, 2025",
      registeredOn: "Mar 5, 2025",
      status: "Confirmed",
    },
    {
      id: 6,
      name: "Jessica Brown",
      email: "j.brown@example.com",
      workshop: "Data Science Fundamentals",
      date: "Mar 18, 2025",
      registeredOn: "Mar 6, 2025",
      status: "Cancelled",
    },
    {
      id: 7,
      name: "Ryan Garcia",
      email: "r.garcia@example.com",
      workshop: "UX Design Workshop",
      date: "Mar 22, 2025",
      registeredOn: "Mar 7, 2025",
      status: "Pending",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Registrations</h1>
        <p className="text-muted-foreground">Manage student registrations for all your workshops.</p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by name or email..." className="pl-10 w-full" />
          </div>
          <Select defaultValue="all-workshops">
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by workshop" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-workshops">All Workshops</SelectItem>
              <SelectItem value="react">Advanced React Patterns</SelectItem>
              <SelectItem value="data-science">Data Science Fundamentals</SelectItem>
              <SelectItem value="ux">UX Design Workshop</SelectItem>
              <SelectItem value="cloud">Cloud Computing Essentials</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all-statuses">
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-statuses">All Statuses</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="gap-2">
          <Download className="h-4 w-4" /> Export Data
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Registrations</CardTitle>
          <CardDescription>View and manage all student registrations.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">
                  <div className="flex items-center gap-1">
                    Student
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>Workshop</TableHead>
                <TableHead>Workshop Date</TableHead>
                <TableHead>Registered On</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.map((registration) => (
                <TableRow key={registration.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`/placeholder.svg?height=32&width=32`} alt={registration.name} />
                        <AvatarFallback>{registration.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{registration.name}</span>
                        <span className="text-xs text-muted-foreground">{registration.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{registration.workshop}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{registration.date}</span>
                    </div>
                  </TableCell>
                  <TableCell>{registration.registeredOn}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        registration.status === "Confirmed"
                          ? "default"
                          : registration.status === "Pending"
                            ? "outline"
                            : "destructive"
                      }
                    >
                      {registration.status}
                    </Badge>
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
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {registration.status === "Pending" && (
                          <>
                            <DropdownMenuItem>
                              <Check className="mr-2 h-4 w-4 text-emerald-500" /> Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <X className="mr-2 h-4 w-4 text-destructive" /> Reject
                            </DropdownMenuItem>
                          </>
                        )}
                        {registration.status === "Confirmed" && (
                          <DropdownMenuItem>
                            <X className="mr-2 h-4 w-4 text-destructive" /> Cancel Registration
                          </DropdownMenuItem>
                        )}
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

