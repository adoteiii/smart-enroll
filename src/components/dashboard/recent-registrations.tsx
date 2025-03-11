import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function RecentRegistrations() {
  const registrations = [
    {
      id: 1,
      name: "Alex Johnson",
      email: "alex.j@example.com",
      workshop: "Advanced React Patterns",
      date: "Mar 10, 2025",
      status: "Confirmed",
    },
    {
      id: 2,
      name: "Samantha Lee",
      email: "sam.lee@example.com",
      workshop: "Data Science Fundamentals",
      date: "Mar 9, 2025",
      status: "Pending",
    },
    {
      id: 3,
      name: "Michael Chen",
      email: "m.chen@example.com",
      workshop: "UX Design Workshop",
      date: "Mar 8, 2025",
      status: "Confirmed",
    },
    {
      id: 4,
      name: "Emily Wilson",
      email: "e.wilson@example.com",
      workshop: "Cloud Computing Essentials",
      date: "Mar 7, 2025",
      status: "Confirmed",
    },
    {
      id: 5,
      name: "David Kim",
      email: "d.kim@example.com",
      workshop: "Advanced React Patterns",
      date: "Mar 6, 2025",
      status: "Confirmed",
    },
  ]

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead>Workshop</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
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
            <TableCell>{registration.date}</TableCell>
            <TableCell>
              <Badge variant={registration.status === "Confirmed" ? "outline" : "secondary"}>
                {registration.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

