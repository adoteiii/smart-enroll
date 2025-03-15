"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpRight, Calendar, ChevronUp, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardChart from "@/components/dashboard/dashboard-chart";
import { UpcomingWorkshops } from "@/components/dashboard/upcoming-workshops";
import { RecentRegistrations } from "@/components/dashboard/recent-registrations";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppSelector } from "@/redux/store";
import dayjs from "dayjs";
import Link from "next/link";
import { Registration } from "@/lib/componentprops";

// Add this helper function at the top of your component or outside
const formatDate = (timestamp: any): string => {
  if (!timestamp) return "";

  // If it's already a number, use it directly with dayjs
  if (typeof timestamp === "number") {
    return dayjs(timestamp).format("MMM D, YYYY");
  }

  // If it's a string that can be parsed by dayjs
  if (typeof timestamp === "string") {
    return dayjs(timestamp).format("MMM D, YYYY");
  }

  // If it's a Firestore timestamp (should be handled before reaching here)
  if (timestamp?.seconds !== undefined) {
    const milliseconds =
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
    return dayjs(milliseconds).format("MMM D, YYYY");
  }

  return timestamp.toString();
};

export default function DashboardPage() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  // Get data from Redux store
  const adminWorkshops =
    useAppSelector((state) => state.AdminWorkshopReducer.value) || [];

  const adminStudents =
    useAppSelector((state) => state.AdminStudentsReducer?.value) || [];

  const registrations =
    useAppSelector((state) => state.AdminRegistrationReducer?.value) || [];

  const organization = useAppSelector(
    (state) => state.OrganizationReducer.value
  );
  const dbUser = useAppSelector((state) => state.DBUserReducer.value);

  // Simulate loading state (remove this in production)
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Calculate all dashboard statistics
  const stats = useMemo(() => {
    if (!adminWorkshops || !registrations) {
      return {
        totalRegistrations: 0,
        activeWorkshops: {
          count: 0,
          startingSoon: 0,
        },
        upcomingEvents: {
          count: 0,
          nextEventDays: null,
        },
        attendanceRate: {
          average: 0,
          trend: 0,
        },
        registrationTrend: 0,
        popularWorkshops: [],
        recentRegistrations: [],
        registrationTrends: [],
      };
    }

    const now = dayjs();
    const lastMonth = now.subtract(1, "month");
    const nextWeek = now.add(1, "week");

    // Extract registrations
    const allRegistrations: Registration[] = registrations;

    // Current month registrations
    const currentMonthRegistrations = allRegistrations.filter((reg) =>
      dayjs(reg.registeredAt).isAfter(lastMonth)
    );

    // Previous month registrations
    const prevMonthRegistrations = allRegistrations.filter(
      (reg) =>
        dayjs(reg.registeredAt).isBefore(now.startOf("month")) &&
        dayjs(reg.registeredAt).isAfter(lastMonth.startOf("month"))
    );

    // Calculate registration trend percentage
    const prevMonthCount = prevMonthRegistrations.length || 1; // Avoid division by zero
    const currentMonthCount = currentMonthRegistrations.length;
    const registrationTrend = Math.round(
      ((currentMonthCount - prevMonthCount) / prevMonthCount) * 100
    );

    // Active workshops (ongoing and not yet completed)
    const activeWorkshops = adminWorkshops.filter(
      (workshop) =>
        dayjs(workshop.startDate).isBefore(now) &&
        dayjs(workshop.endDate).isAfter(now)
    );

    // Workshops starting this week
    const workshopsStartingSoon = adminWorkshops.filter(
      (workshop) =>
        dayjs(workshop.startDate).isAfter(now) &&
        dayjs(workshop.startDate).isBefore(nextWeek)
    );

    // Upcoming workshops (not yet started)
    const upcomingWorkshops = adminWorkshops.filter((workshop) =>
      dayjs(workshop.startDate).isAfter(now)
    );

    // Find days until next workshop
    const nextEventDays =
      upcomingWorkshops.length > 0
        ? upcomingWorkshops
            .map((w) => dayjs(w.startDate).diff(now, "day"))
            .sort((a, b) => a - b)[0]
        : null;

    // Calculate average attendance rate
    const completedWorkshops = adminWorkshops.filter(
      (workshop) => workshop.attendance && dayjs(workshop.endDate).isBefore(now)
    );

    const averageAttendance =
      completedWorkshops.length > 0
        ? Math.round(
            completedWorkshops.reduce((sum, workshop) => {
              const attended = workshop.attendance?.attended || 0;
              const total = workshop.attendance?.total || 1; // Avoid division by zero
              return sum + (attended / total) * 100;
            }, 0) / completedWorkshops.length
          )
        : 0;

    // Calculate attendance trend
    const recentCompletedWorkshops = completedWorkshops.filter((w) =>
      dayjs(w.endDate).isAfter(lastMonth)
    );

    const olderCompletedWorkshops = completedWorkshops.filter(
      (w) =>
        dayjs(w.endDate).isBefore(lastMonth) &&
        dayjs(w.endDate).isAfter(lastMonth.subtract(1, "month"))
    );

    const recentAttendance =
      recentCompletedWorkshops.length > 0
        ? recentCompletedWorkshops.reduce((sum, workshop) => {
            const attended = workshop.attendance?.attended || 0;
            const total = workshop.attendance?.total || 1;
            return sum + (attended / total) * 100;
          }, 0) / recentCompletedWorkshops.length
        : 0;

    const olderAttendance =
      olderCompletedWorkshops.length > 0
        ? olderCompletedWorkshops.reduce((sum, workshop) => {
            const attended = workshop.attendance?.attended || 0;
            const total = workshop.attendance?.total || 1;
            return sum + (attended / total) * 100;
          }, 0) / olderCompletedWorkshops.length
        : 0;

    const attendanceTrend =
      olderAttendance > 0
        ? Math.round(
            ((recentAttendance - olderAttendance) / olderAttendance) * 100
          )
        : 0;

    // Popular workshops by enrollment rate
    const popularWorkshops = adminWorkshops
      .map((workshop) => {
        const capacity = workshop.capacity || 1;

        // Count registrations for this workshop
        const enrolled = registrations.filter(
          (r) => r.workshopId === workshop.docID && r.status === "confirmed"
        ).length;

        const enrollmentRate = Math.round((enrolled / capacity) * 100);

        return {
          id: workshop.docID,
          title: workshop.title || "Untitled Workshop",
          enrollmentRate: enrollmentRate > 100 ? 100 : enrollmentRate,
        };
      })
      .sort((a, b) => b.enrollmentRate - a.enrollmentRate)
      .slice(0, 5);

    // Recent registrations

    const recentRegistrations = [...allRegistrations] // Create a new array copy first
      .sort((a, b) => {
        // Safely handle the registered date comparison
        const dateA = a.registeredAt ? dayjs(a.registeredAt).unix() : 0;
        const dateB = b.registeredAt ? dayjs(b.registeredAt).unix() : 0;
        return dateB - dateA;
      })
      .slice(0, 5)
      .map((reg) => {
        const workshop = adminWorkshops.find((w) => w.docID === reg.workshopId);

        return {
          id: reg.docID,
          studentName: reg.student?.name || "Unknown Student",
          studentAvatar: reg.student?.profileImage || null,
          workshopTitle: workshop?.title || "Unknown Workshop",
          date:
            typeof reg.registeredAt === "number"
              ? reg.registeredAt
              : dayjs(reg.registeredAt).valueOf(),
        };
      });

    // Registration trends data for chart (last 30 days)
    const last30Days = Array.from({ length: 30 }, (_, i) =>
      now.subtract(i, "day").format("YYYY-MM-DD")
    ).reverse();

    const registrationsByDay = last30Days.map((date) => {
      const count = [...allRegistrations].filter((reg) => {
        // Handle different timestamp formats
        if (typeof reg.registeredAt === "number") {
          return dayjs(reg.registeredAt).format("YYYY-MM-DD") === date;
        }
        return dayjs(reg.registeredAt).format("YYYY-MM-DD") === date;
      }).length;

      return {
        date,
        value: count,
      };
    });

    return {
      totalRegistrations: allRegistrations.length,
      registrationTrend,
      activeWorkshops: {
        count: activeWorkshops.length,
        startingSoon: workshopsStartingSoon.length,
      },
      upcomingEvents: {
        count: upcomingWorkshops.length,
        nextEventDays,
      },
      attendanceRate: {
        average: averageAttendance,
        trend: attendanceTrend,
      },
      popularWorkshops,
      recentRegistrations,
      registrationTrends: registrationsByDay,
    };
  }, [adminWorkshops, adminStudents, registrations]);

  // Format registration trend text
  const registrationTrendText =
    stats.registrationTrend >= 0
      ? `+${stats.registrationTrend}% from last month`
      : `${stats.registrationTrend}% from last month`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your workshop management system.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Registrations Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Registrations
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats.totalRegistrations}
                </div>
                <p className="text-xs text-muted-foreground">
                  {registrationTrendText}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Active Workshops Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Workshops
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats.activeWorkshops.count}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeWorkshops.startingSoon} starting this week
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Attendance Rate Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Attendance Rate
            </CardTitle>
            {(stats.attendanceRate?.trend ?? 0) > 0 ? (
              <ChevronUp className="h-4 w-4 text-emerald-500" />
            ) : (
              <ChevronUp className="h-4 w-4 text-red-500 rotate-180" />
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats.attendanceRate?.average ?? 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {(stats.attendanceRate?.trend ?? 0) >= 0 ? "+" : ""}
                  {stats.attendanceRate?.trend ?? 0}% from previous workshops
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Workshops
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats.upcomingEvents?.count ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Next event{" "}
                  {stats.upcomingEvents?.nextEventDays !== null
                    ? `in ${stats.upcomingEvents?.nextEventDays} days`
                    : "not scheduled"}
                </p>
              </>
            )}
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
                <CardDescription>
                  Workshop registrations over the past 30 days
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                {loading ? (
                  <div className="h-[350px] flex items-center justify-center">
                    <Skeleton className="h-[300px] w-full" />
                  </div>
                ) : (
                  <DashboardChart data={stats.registrationTrends} />
                )}
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Upcoming Workshops</CardTitle>
                <CardDescription>Your next scheduled workshops</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : (
                  <UpcomingWorkshops
                    workshops={adminWorkshops
                      .filter((w) => dayjs(w.startDate).isAfter(dayjs()))
                      .sort(
                        (a, b) =>
                          dayjs(a.startDate).unix() - dayjs(b.startDate).unix()
                      )
                      .slice(0, 5)}
                  />
                )}
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
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto gap-1"
                  asChild
                >
                  <Link href="/dashboard/registrations">
                    <span>View All</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <RecentRegistrations
                    registrations={stats.recentRegistrations}
                  />
                )}
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Popular Workshops</CardTitle>
                <CardDescription>
                  Workshops with highest enrollment rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-2 w-full" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stats.popularWorkshops.map((workshop) => (
                      <div key={workshop.id} className="flex items-center">
                        <div className="w-full space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium">
                              {workshop.title}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {workshop.enrollmentRate}%
                            </div>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${workshop.enrollmentRate}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>
                Detailed insights into your workshop performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Analytics content will be displayed here. This section would
                include more detailed charts, demographic breakdowns, and
                conversion metrics.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generated Reports</CardTitle>
              <CardDescription>
                Download and view your workshop reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Reports content will be displayed here. This section would
                include downloadable reports, scheduled report generation, and
                report templates.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
