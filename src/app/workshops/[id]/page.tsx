"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useContext } from "react"
import { Context } from "@/lib/userContext"
import type { WorkshopComponentProps } from "@/lib/componentprops"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase"
import { format } from "date-fns"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, ArrowLeft, Book, Tag, Award, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppSelector } from "@/redux/store"
import RegistrationForm from "@/components/workshops/RegistrationForm"

export default function WorkshopDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useContext(Context)

  const [workshop, setWorkshop] = useState<WorkshopComponentProps | null>(null)
  const [loading, setLoading] = useState(true)
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)

  // Get workshops from Redux for initial load
  const reduxWorkshops = useAppSelector((state) => state.WorkshopReducer.value)

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

  // Fetch workshop data from Firestore
  useEffect(() => {
    if (!id) return

    const fetchWorkshop = async () => {
      setLoading(true)
      // First try to get from Redux state
      if (reduxWorkshops && reduxWorkshops.length > 0) {
        const foundWorkshop = reduxWorkshops.find((w) => w.docID === id)
        if (foundWorkshop) {
          setWorkshop(foundWorkshop)
          setLoading(false)
          return
        }
      }

      // If not found in Redux, fetch from Firestore
      try {
        const workshopDoc = await getDoc(doc(db, "workshops", id as string))

        if (workshopDoc.exists()) {
          const workshopData = {
            ...workshopDoc.data(),
            docID: workshopDoc.id,
          } as WorkshopComponentProps

          setWorkshop(workshopData)
        } else {
          toast.error("Workshop not found")
          router.push("/workshops")
        }
      } catch (error) {
        console.error("Error fetching workshop:", error)
        toast.error("Failed to load workshop details")
      } finally {
        setLoading(false)
      }
    }

    fetchWorkshop()
  }, [id, reduxWorkshops, router])

  // Check if workshop is full
  const isWorkshopFull = () => {
    if (!workshop) return false
    return workshop.registeredCount >= workshop.capacity
  }

  // Check if workshop has ended
  const isWorkshopEnded = () => {
    if (!workshop) return false
    return getTimestamp(workshop.endDate) < Date.now()
  }

  // Handle registration click
  const handleRegisterClick = () => {
    // Only check if workshop has ended or is full
    if (isWorkshopFull() && !workshop?.enableWaitlist) {
      toast.error("This workshop is full")
      return
    }

    if (isWorkshopEnded()) {
      toast.error("This workshop has already ended")
      return
    }

    // Open registration form - no login required
    setShowRegistrationForm(true)
  }

  // Handle successful registration
  const handleRegistrationSuccess = (updatedWorkshop: WorkshopComponentProps) => {
    setWorkshop(updatedWorkshop)
  }

  // Format workshop status
  const getStatusBadge = () => {
    if (!workshop) return null
    const now = Date.now()

    if (getTimestamp(workshop.startDate) > now) {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          Upcoming
        </Badge>
      )
    } else if (getTimestamp(workshop.startDate) <= now && getTimestamp(workshop.endDate) >= now) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700">
          Ongoing
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700">
          Past
        </Badge>
      )
    }
  }

  // Render skeleton during loading
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.push("/workshops")} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Workshops
          </Button>
          <Skeleton className="h-10 w-3/4 mb-2" />
          <Skeleton className="h-6 w-1/2 mb-6" />
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <Skeleton className="h-64 w-full rounded-lg mb-6" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-full" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!workshop) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Workshop not found</h1>
          <p className="mb-6">The workshop you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push("/workshops")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Workshops
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Back button and header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.push("/workshops")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Workshops
        </Button>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-3xl font-bold">{workshop.title}</h1>
          {getStatusBadge()}
        </div>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          By {workshop.organization_name || "Organization"}
          {workshop.speaker?.name && ` • ${workshop.speaker.name}`}
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Main content */}
        <div className="md:col-span-2">
          {/* Workshop image */}
          {workshop.workshopImage && workshop.workshopImage.length > 0 && (
            <div className="mb-6 overflow-hidden rounded-lg">
              <img
                src={workshop.workshopImage[0] || "/placeholder.svg"}
                alt={workshop.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Workshop description */}
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-3">About this workshop</h2>
              <div className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>{workshop.description}</p>
              </div>
            </div>

            {/* Speaker information */}
            {workshop.speaker && (
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">About the Speaker</h2>
                <div className="flex items-start gap-4">
                  {workshop.speaker.profileImage ? (
                    <img
                      src={workshop.speaker.profileImage || "/placeholder.svg"}
                      alt={workshop.speaker.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <User className="h-8 w-8 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-lg">{workshop.speaker.name}</h3>
                    <p className="text-gray-500">{workshop.speaker.title || "Speaker"}</p>
                    <p className="text-gray-700 dark:text-gray-300 mt-2">
                      {workshop.speaker.bio || "No bio available"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Agenda as timeline */}
            {workshop.agenda && workshop.agenda.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Workshop Schedule</h2>
                <div className="space-y-4">
                  {workshop.agenda.map((item, index) => (
                    <div key={index} className="border-l-2 border-gray-200 pl-4 py-1">
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-gray-500 text-sm">{item.duration} min</p>
                      <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Registration card */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Registration</CardTitle>
              <CardDescription>Workshop details and enrollment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{format(new Date(getTimestamp(workshop.startDate)), "EEEE, MMMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>
                  {format(new Date(getTimestamp(workshop.startDate)), "h:mm a")} -
                  {format(new Date(getTimestamp(workshop.endDate)), "h:mm a")}
                </span>
              </div>
              {workshop.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{workshop.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span>
                  {workshop.registeredCount || 0} / {workshop.capacity} enrolled
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-gray-500" />
                <span>{workshop.level.charAt(0).toUpperCase() + workshop.level.slice(1)} level</span>
              </div>
              {workshop.category && (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <span>{workshop.category}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Book className="h-4 w-4 text-gray-500" />
                <span>{workshop.isFree ? "Free workshop" : "Paid workshop"}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                disabled={(isWorkshopFull() && !workshop.enableWaitlist) || isWorkshopEnded()}
                variant={isWorkshopFull() && !workshop.enableWaitlist ? "outline" : "default"}
                onClick={handleRegisterClick}
              >
                {isWorkshopEnded()
                  ? "Workshop Ended"
                  : isWorkshopFull()
                    ? workshop.enableWaitlist
                      ? "Join Waitlist"
                      : "Workshop Full"
                    : "Register Now"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Registration Form Dialog */}
      {workshop && showRegistrationForm && (
        <RegistrationForm
          workshop={workshop}
          isOpen={showRegistrationForm}
          onClose={() => setShowRegistrationForm(false)}
          onSuccess={handleRegistrationSuccess}
          currentUser={user || { uid: "", email: "", displayName: "" }}
        />
      )}
    </div>
  )
}

