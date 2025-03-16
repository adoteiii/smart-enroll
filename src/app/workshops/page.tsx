"use client"

import { useState, useEffect } from "react"
import { useContext } from "react"
import { Context } from "@/lib/userContext"
import type { WorkshopComponentProps } from "@/lib/componentprops"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppSelector } from "@/redux/store"

export default function WorkshopsPage() {
  const { user } = useContext(Context)
  const router = useRouter()

  // Get workshops from Redux instead of fetching directly
  const reduxWorkshops = useAppSelector((state) => state.WorkshopReducer.value)

  const [filteredWorkshops, setFilteredWorkshops] = useState<WorkshopComponentProps[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [levelFilter, setLevelFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  // Helper function to get timestamp in milliseconds from various formats
  const getTimestamp = (date: any): number => {
    if (typeof date === "number") {
      return date
    }
    if (typeof date === "string") {
      return new Date(date).getTime()
    }
    if (date && typeof date === "object" && date.seconds) {
      // Firestore timestamp
      return date.seconds * 1000 + date.nanoseconds / 1000000
    }
    return 0 // Default fallback
  }

  // Set loading to false when Redux workshops are loaded
  useEffect(() => {
    if (reduxWorkshops !== undefined) {
      setLoading(false)
    }
  }, [reduxWorkshops])

  // Apply filters when search or filters change or when redux workshops change
  useEffect(() => {
    if (!reduxWorkshops) {
      return
    }

    let result = [...reduxWorkshops]

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (workshop) =>
          workshop.title?.toLowerCase().includes(query) ||
          workshop.description?.toLowerCase().includes(query) ||
          workshop.organization_name?.toLowerCase().includes(query) ||
          workshop.speaker?.name?.toLowerCase().includes(query),
      )
    }

    // Filter by category
    if (categoryFilter !== "all") {
      result = result.filter((workshop) => workshop.category === categoryFilter)
    }

    // Filter by level
    if (levelFilter !== "all") {
      result = result.filter((workshop) => workshop.level === levelFilter)
    }

    // Filter by status
    const now = Date.now()
    if (statusFilter === "upcoming") {
      result = result.filter((workshop) => getTimestamp(workshop.startDate) > now)
    } else if (statusFilter === "ongoing") {
      result = result.filter(
        (workshop) => getTimestamp(workshop.startDate) <= now && getTimestamp(workshop.endDate) >= now,
      )
    } else if (statusFilter === "past") {
      result = result.filter((workshop) => getTimestamp(workshop.endDate) < now)
    }
    // No filter for "all"

    // Sort workshops by start date
    if (statusFilter === "past") {
      result = result.sort((a, b) => getTimestamp(b.endDate) - getTimestamp(a.endDate))
    } else {
      result = result.sort((a, b) => getTimestamp(a.startDate) - getTimestamp(b.startDate))
    }

    setFilteredWorkshops(result)
  }, [searchQuery, categoryFilter, levelFilter, statusFilter, reduxWorkshops])

  const handleRegister = (workshop: WorkshopComponentProps) => {
    // Navigate to workshop details page with registration option
    router.push(`/workshops/${workshop.docID}`)
  }

  // Extract unique categories for filter
  const categories = reduxWorkshops
    ? ["all", ...Array.from(new Set(reduxWorkshops.map((w) => w.category).filter(Boolean)))]
    : ["all"]

  // Check if workshop is full
  const isWorkshopFull = (workshop: WorkshopComponentProps) => {
    return workshop.registeredCount >= workshop.capacity
  }

  // Check if user is registered
  const isUserRegistered = (workshop: WorkshopComponentProps) => {
    return user && workshop.registeredStudents?.some((student) => student.uid === user.uid)
  }

  // Get workshop status badge
  const getStatusBadge = (workshop: WorkshopComponentProps) => {
    const now = Date.now()

    if (getTimestamp(workshop.startDate) > now) {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 font-medium rounded-full px-3">
          Upcoming
        </Badge>
      )
    } else if (getTimestamp(workshop.startDate) <= now && getTimestamp(workshop.endDate) >= now) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 font-medium rounded-full px-3">
          Ongoing
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 font-medium rounded-full px-3">
          Past
        </Badge>
      )
    }
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-7xl">
      <div className="mb-12 text-center md:text-left">
        <h1 className="text-4xl font-bold mb-3 tracking-tight">Available Workshops</h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl">
          Discover and register for workshops to enhance your skills and advance your career
        </p>
      </div>

      {/* Filters and Search */}
      <div className="grid gap-4 mb-10 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Input
            placeholder="Search workshops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 rounded-full border-gray-200 dark:border-gray-700 px-4"
          />
        </div>
        <div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-11 rounded-full border-gray-200 dark:border-gray-700">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories
                .filter((c) => c !== "all")
                .map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="h-11 rounded-full border-gray-200 dark:border-gray-700">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Tabs defaultValue="all" value={statusFilter} onValueChange={setStatusFilter} className="w-full">
            <TabsList className="w-full h-11 rounded-full bg-gray-100 dark:bg-gray-800 p-1">
              <TabsTrigger value="all" className="flex-1 rounded-full">
                All
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="flex-1 rounded-full">
                Upcoming
              </TabsTrigger>
              <TabsTrigger value="ongoing" className="flex-1 rounded-full">
                Ongoing
              </TabsTrigger>
              <TabsTrigger value="past" className="flex-1 rounded-full">
                Past
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Workshop Cards */}
      {loading ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden border-0  bg-white dark:bg-gray-950">
              <Skeleton className="h-40 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredWorkshops.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredWorkshops.map((workshop) => (
            <Card
              key={workshop.docID}
              className="overflow-hidden flex flex-col border-0  transition-shadow duration-200 bg-white dark:bg-gray-950"
            >
              {workshop.workshopImage && workshop.workshopImage.length > 0 && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={workshop.workshopImage[0] || "/placeholder.svg"}
                    alt={workshop.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              )}
              <CardHeader className="px-5 pt-5 pb-2">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="line-clamp-2 text-xl font-semibold">{workshop.title}</CardTitle>
                  {getStatusBadge(workshop)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1.5">
                  By {workshop.organization_name || "Organization"}
                  {workshop.speaker?.name && ` • ${workshop.speaker.name}`}
                </div>
              </CardHeader>
              <CardContent className="flex-grow px-5 py-3">
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 mb-5 leading-relaxed">
                  {workshop.description}
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(getTimestamp(workshop.startDate)), "MMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {format(new Date(getTimestamp(workshop.startDate)), "h:mm a")} -
                      {format(new Date(getTimestamp(workshop.endDate)), "h:mm a")}
                    </span>
                  </div>
                  {workshop.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="line-clamp-1">{workshop.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>
                      {workshop.registeredCount || 0} / {workshop.capacity} enrolled
                    </span>
                  </div>
                  <div>
                    <Badge variant="secondary" className="mr-2 rounded-full px-3 font-medium">
                      {workshop.level.charAt(0).toUpperCase() + workshop.level.slice(1)}
                    </Badge>
                    {workshop.isFree ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 rounded-full px-3 font-medium">
                        Free
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="rounded-full px-3 font-medium">
                        Paid
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="px-5 pb-5 pt-2">
                <Button
                  className="w-full rounded-full h-11 font-medium"
                  variant={isWorkshopFull(workshop) ? "outline" : "default"}
                  disabled={
                    (isWorkshopFull(workshop) && !workshop.enableWaitlist) ||
                    getTimestamp(workshop.endDate) < Date.now()
                  }
                  onClick={() => handleRegister(workshop)}
                >
                  {getTimestamp(workshop.endDate) < Date.now()
                    ? "Workshop Ended"
                    : isWorkshopFull(workshop)
                      ? workshop.enableWaitlist
                        ? "Join Waitlist"
                        : "Workshop Full"
                      : "Register Now"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <h3 className="text-2xl font-medium mb-3">No workshops found</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
            Try adjusting your search or filters to find workshops that match your criteria
          </p>
          <Button
            variant="outline"
            size="lg"
            className="rounded-full"
            onClick={() => {
              setCategoryFilter("all")
              setLevelFilter("all")
              setStatusFilter("all")
              setSearchQuery("")
            }}
          >
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  )
}

