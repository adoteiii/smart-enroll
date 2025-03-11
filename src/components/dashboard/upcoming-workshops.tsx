import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Users } from "lucide-react"

export function UpcomingWorkshops() {
  const workshops = [
    {
      id: 1,
      title: "Advanced React Patterns",
      date: "Mar 15, 2025",
      time: "10:00 AM - 2:00 PM",
      attendees: 45,
      capacity: 50,
      status: "Open",
    },
    {
      id: 2,
      title: "Data Science Fundamentals",
      date: "Mar 18, 2025",
      time: "1:00 PM - 5:00 PM",
      attendees: 32,
      capacity: 40,
      status: "Open",
    },
    {
      id: 3,
      title: "UX Design Workshop",
      date: "Mar 22, 2025",
      time: "9:00 AM - 12:00 PM",
      attendees: 28,
      capacity: 30,
      status: "Almost Full",
    },
    {
      id: 4,
      title: "Cloud Computing Essentials",
      date: "Mar 25, 2025",
      time: "2:00 PM - 6:00 PM",
      attendees: 15,
      capacity: 35,
      status: "Open",
    },
  ]

  return (
    <div className="space-y-4">
      {workshops.map((workshop) => (
        <div key={workshop.id} className="flex flex-col space-y-2 rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{workshop.title}</h3>
            <Badge variant={workshop.status === "Almost Full" ? "destructive" : "outline"}>{workshop.status}</Badge>
          </div>
          <div className="flex flex-col space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              {workshop.date}
            </div>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              {workshop.time}
            </div>
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              {workshop.attendees}/{workshop.capacity} Registered
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm">
              Details
            </Button>
            <Button size="sm">Manage</Button>
          </div>
        </div>
      ))}
    </div>
  )
}

