import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpRight, Calendar, ChevronUp, Clock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardChart } from "@/components/dashboard/dashboard-chart"
import { UpcomingWorkshops } from "@/components/dashboard/upcoming-workshops"
import { RecentRegistrations } from "@/components/dashboard/recent-registrations"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's an overview of your workshop management system.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,248</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workshops</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">2 starting this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Attendance Rate</CardTitle>
            <ChevronUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92.4%</div>
            <p className="text-xs text-muted-foreground">+2.1% from previous workshops</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Next event in 3 days</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Registration Trends</CardTitle>
                <CardDescription>Workshop registrations over the past 30 days</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <DashboardChart />
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Upcoming Workshops</CardTitle>
                <CardDescription>Your next scheduled workshops</CardDescription>
              </CardHeader>
              <CardContent>
                <UpcomingWorkshops />
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader className="flex flex-row items-center">
                <div className="grid gap-1">
                  <CardTitle>Recent Registrations</CardTitle>
                  <CardDescription>Latest student enrollments</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="ml-auto gap-1">
                  <span>View All</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
              </CardHeader>
              <CardContent>
                <RecentRegistrations />
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Popular Workshops</CardTitle>
                <CardDescription>Workshops with highest enrollment rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-full space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Advanced React Patterns</div>
                        <div className="text-sm text-muted-foreground">98%</div>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div className="h-full w-[98%] rounded-full bg-primary"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-full space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Data Science Fundamentals</div>
                        <div className="text-sm text-muted-foreground">89%</div>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div className="h-full w-[89%] rounded-full bg-primary"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-full space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">UX Design Workshop</div>
                        <div className="text-sm text-muted-foreground">82%</div>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div className="h-full w-[82%] rounded-full bg-primary"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-full space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Cloud Computing Essentials</div>
                        <div className="text-sm text-muted-foreground">74%</div>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div className="h-full w-[74%] rounded-full bg-primary"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>Detailed insights into your workshop performance</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Analytics content will be displayed here. This section would include more detailed charts, demographic
                breakdowns, and conversion metrics.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generated Reports</CardTitle>
              <CardDescription>Download and view your workshop reports</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Reports content will be displayed here. This section would include downloadable reports, scheduled
                report generation, and report templates.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

