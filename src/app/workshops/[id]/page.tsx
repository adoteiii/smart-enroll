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
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  Book,
  Tag,
  Award,
  User,
  Share2,
  Bookmark,
  CheckCircle,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppSelector } from "@/redux/store"
import RegistrationForm from "@/components/workshops/RegistrationForm"
import { Separator } from "@/components/ui/separator"

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
    toast.success("Successfully registered for the workshop!")
  }

  // Format workshop status
  const getStatusBadge = () => {
    if (!workshop) return null
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

  // Render skeleton during loading
  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-7xl">
        <div className="mb-12">
          <Button variant="ghost" onClick={() => router.push("/workshops")} className="mb-6 rounded-full">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Workshops
          </Button>
          <Skeleton className="h-12 w-3/4 mb-3" />
          <Skeleton className="h-6 w-1/2 mb-8" />
        </div>
        <div className="grid gap-10 md:grid-cols-3">
          <div className="md:col-span-2">
            <Skeleton className="h-[400px] w-full rounded-xl mb-8" />
            <div className="space-y-6">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
          <div>
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <Skeleton className="h-7 w-full" />
                <Skeleton className="h-5 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-5">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-11 w-full rounded-full" />
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!workshop) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-7xl">
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <h1 className="text-3xl font-bold mb-4">Workshop not found</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
            The workshop you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.push("/workshops")} className="rounded-full">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Workshops
          </Button>
        </div>
      </div>
    )
  }

  // Generate key takeaways from description if not provided
  const keyTakeaways = Array.isArray(workshop.additionalInformation) 
    ? workshop.additionalInformation 
    : workshop.additionalInformation 
      ? [workshop.additionalInformation] 
      : [
          "Gain practical skills and knowledge in this area",
          "Learn from industry experts with real-world experience",
          "Network with peers and build professional connections",
        ]

  return (
    <div className="container mx-auto py-12 px-4 max-w-7xl">
      {/* Back button and header */}
      <div className="mb-10">
        <Button
          variant="ghost"
          onClick={() => router.push("/workshops")}
          className="mb-6 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Workshops
        </Button>
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <h1 className="text-4xl font-bold tracking-tight">{workshop.title}</h1>
          {getStatusBadge()}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-gray-500 dark:text-gray-400">
          <span className="font-medium">By {workshop.organization_name || "Organization"}</span>
          {workshop.speaker?.name && (
            <>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <span>Presented by {workshop.speaker.name}</span>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-10 md:grid-cols-3">
        {/* Main content */}
        <div className="md:col-span-2">
          {/* Workshop image */}
          {workshop.workshopImage && workshop.workshopImage.length > 0 && (
            <div className="mb-8 overflow-hidden rounded-xl shadow-sm">
              <img
                src={workshop.workshopImage[0] || "/placeholder.svg"}
                alt={workshop.title}
                className="w-full h-auto object-cover aspect-video"
              />
            </div>
          )}

          {/* Quick info for mobile */}
          <div className="md:hidden mb-8">
            <Card className="border-0 shadow-sm bg-gray-50 dark:bg-gray-900">
              <CardContent className="p-5 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div className="text-sm">
                    <div className="font-medium">Date</div>
                    <div>{format(new Date(getTimestamp(workshop.startDate)), "MMM d, yyyy")}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <div className="text-sm">
                    <div className="font-medium">Time</div>
                    <div>{format(new Date(getTimestamp(workshop.startDate)), "h:mm a")}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <div className="text-sm">
                    <div className="font-medium">Level</div>
                    <div>{workshop.level.charAt(0).toUpperCase() + workshop.level.slice(1)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <div className="text-sm">
                    <div className="font-medium">Capacity</div>
                    <div>
                      {workshop.registeredCount || 0} / {workshop.capacity}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Workshop description */}
          <div className="space-y-10">
            <div>
              <h2 className="text-2xl font-semibold mb-4">About this workshop</h2>
              <div className="text-gray-700 dark:text-gray-300 space-y-4 leading-relaxed">
                <p>{workshop.description}</p>
              </div>
            </div>

            {/* Key takeaways */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">What you'll learn</h2>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
                <ul className="space-y-3">
                  {keyTakeaways.map((item:string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Speaker information */}
            {workshop.speaker && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">About the Speaker</h2>
                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl">
                  <div className="flex items-start gap-5">
                    {workshop.speaker.profileImage ? (
                      <img
                        src={workshop.speaker.profileImage || "/placeholder.svg"}
                        alt={workshop.speaker.name}
                        className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <User className="h-10 w-10 text-gray-500" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-xl mb-1">{workshop.speaker.name}</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-3">{workshop.speaker.bio || "Speaker"}</p>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {workshop.speaker.bio || "No bio available for this speaker."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Who should attend */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Who should attend</h2>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Professionals looking to advance their skills in {workshop.category || "this field"}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Students interested in gaining practical knowledge and experience</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Anyone with a {workshop.level} level understanding of the subject</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Share and save buttons */}
            <div className="pt-4">
              <Separator className="mb-6" />
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                    toast.success("Link copied to clipboard")
                  }}
                >
                  <Share2 className="h-4 w-4 mr-2" /> Share
                </Button>
                <Button variant="outline" className="rounded-full">
                  <Bookmark className="h-4 w-4 mr-2" /> Save
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Registration card */}
        <div>
          <Card className="sticky top-24 border-0 shadow-sm overflow-hidden">
            <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b pb-4">
              <CardTitle className="text-xl">Registration Details</CardTitle>
              <CardDescription>Secure your spot in this workshop</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Date</div>
                  <div>{format(new Date(getTimestamp(workshop.startDate)), "EEEE, MMMM d, yyyy")}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Time</div>
                  <div>
                    {format(new Date(getTimestamp(workshop.startDate)), "h:mm a")} -{" "}
                    {format(new Date(getTimestamp(workshop.endDate)), "h:mm a")}
                  </div>
                </div>
              </div>
              {workshop.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium">Location</div>
                    <div>{workshop.location}</div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Capacity</div>
                  <div className="flex items-center gap-2">
                    <span>
                      {workshop.registeredCount || 0} / {workshop.capacity} enrolled
                    </span>
                    {isWorkshopFull() && !workshop.enableWaitlist && (
                      <Badge variant="outline" className="bg-red-50 text-red-700 rounded-full px-2 text-xs">
                        Full
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Level</div>
                  <div>{workshop.level.charAt(0).toUpperCase() + workshop.level.slice(1)}</div>
                </div>
              </div>
              {workshop.category && (
                <div className="flex items-center gap-3">
                  <Tag className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Category</div>
                    <div>{workshop.category}</div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Book className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Price</div>
                  <div className="flex items-center gap-2">
                    {workshop.isFree ? (
                      <>
                        <span>Free</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700 rounded-full px-2 text-xs">
                          Free
                        </Badge>
                      </>
                    ) : (
                      <span>Paid workshop</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2 pb-6">
              <Button
                className="w-full h-12 rounded-full font-medium text-base"
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
        />
      )}
    </div>
  )
}

