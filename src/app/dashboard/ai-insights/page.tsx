import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Badge } from "@/components/ui/badge"

export default function AIInsightsPage() {
  // Sample data for charts
  const registrationsByDay = [
    { name: "Mon", value: 24 },
    { name: "Tue", value: 18 },
    { name: "Wed", value: 32 },
    { name: "Thu", value: 45 },
    { name: "Fri", value: 38 },
    { name: "Sat", value: 15 },
    { name: "Sun", value: 12 },
  ]

  const workshopPopularity = [
    { name: "Advanced React", value: 35 },
    { name: "Data Science", value: 28 },
    { name: "UX Design", value: 22 },
    { name: "Cloud Computing", value: 15 },
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

  const demographicData = [
    { name: "Students", value: 45 },
    { name: "Professionals", value: 35 },
    { name: "Educators", value: 15 },
    { name: "Others", value: 5 },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">AI Insights</h1>
        <p className="text-muted-foreground">AI-powered analytics and insights for your workshops.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Insight</CardTitle>
            <CardDescription>Registration patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Thursdays</div>
            <p className="text-xs text-muted-foreground">are your most popular registration days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Trending Topic</CardTitle>
            <CardDescription>Based on registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">React</div>
            <p className="text-xs text-muted-foreground">has 35% higher registration rate than average</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Suggested Action</CardTitle>
            <CardDescription>Based on AI analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Add Capacity</div>
            <p className="text-xs text-muted-foreground">to UX Design Workshop (92% full)</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="registration" className="space-y-4">
        <TabsList>
          <TabsTrigger value="registration">Registration Insights</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>
        <TabsContent value="registration" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Registration by Day of Week</CardTitle>
                <CardDescription>When students are most likely to register</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={registrationsByDay}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Workshop Popularity</CardTitle>
                <CardDescription>Distribution of registrations by workshop</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={workshopPopularity}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {workshopPopularity.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Insights</CardTitle>
              <CardDescription>Automatically generated insights based on your registration data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <Badge>Peak Time</Badge>
                    <h3 className="font-medium">Registration Peak Times</h3>
                  </div>
                  <p className="mt-2 text-sm">
                    Most of your registrations occur between 12 PM and 2 PM on weekdays. Consider sending promotional
                    emails during this time window for maximum impact.
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <Badge>Trend</Badge>
                    <h3 className="font-medium">Growing Interest in Data Science</h3>
                  </div>
                  <p className="mt-2 text-sm">
                    Data Science workshop registrations have increased by 28% in the last month. Consider adding more
                    advanced data science workshops to your schedule.
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <Badge>Recommendation</Badge>
                    <h3 className="font-medium">Capacity Planning</h3>
                  </div>
                  <p className="mt-2 text-sm">
                    UX Design Workshop is at 92% capacity with 2 weeks remaining until the event. Consider increasing
                    capacity or adding another session to accommodate demand.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="demographics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendee Demographics</CardTitle>
              <CardDescription>Breakdown of who is attending your workshops</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={demographicData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {demographicData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Metrics</CardTitle>
              <CardDescription>How students are engaging with your workshops</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Engagement metrics will be displayed here. This section would include attendance rates, participation
                metrics, and feedback scores.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

