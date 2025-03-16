"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Filter,
  RefreshCcw,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { AppDispatch, useAppSelector } from "@/redux/store";
import {
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

import {
  markNotificationAsRead,
  deleteNotification,
} from "@/lib/firebase/notifications";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationItem } from "@/components/notifications/notification-item";
import { db } from "@/lib/firebase/firebase";
import { useDispatch } from "react-redux";
import { setNotifications } from "@/redux/features/notificationSlice";
import { FirebaseNotification } from "@/lib/componentprops";
import Loader from "@/components/loader/Loader";

// Notification types matching the ones in settings
const NOTIFICATION_TYPES = {
  NEW_REGISTRATION: "new-registration",
  WORKSHOP_REMINDER: "workshop-reminder",
  CAPACITY_ALERT: "capacity-alert",
  FEEDBACK_RECEIVED: "feedback-received",
  APPROVAL_REQUEST: "approval-request",
};

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const notifications = useAppSelector(
    (state) => state.NotificationReducer.value
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const user = useAppSelector((state) => state.DBUserReducer.value);

  // Mark all as read
  const markAllAsRead = async () => {
    if (!user?.uid) return;

    try {
      const unreadNotifications = notifications?.filter(
        (notif) => !notif.viewed[user.uid]
      );
      if (!unreadNotifications) return;
      // Update each unread notification
      for (const notif of unreadNotifications) {
        await markNotificationAsRead(notif.id, user.uid);
        // auto updated
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Delete all read notifications
  const clearReadNotifications = async () => {
    if (!user?.uid) return;

    try {
      const readNotifications = notifications?.filter(
        (notif) => notif.viewed[user.uid]
      );
      if (!readNotifications) return;
      // Delete each read notification
      for (const notif of readNotifications) {
        await deleteNotification(notif.id, user.uid);
      }
    } catch (error) {
      console.error("Error clearing read notifications:", error);
    }
  };

  // Handle notification action (mark as read)
  const handleNotificationAction = async (
    id: string,
    action: "read" | "delete"
  ) => {
    if (!user?.uid) return;
    try {
      if (action === "read") {
        await markNotificationAsRead(id, user.uid);
      } else if (action === "delete") {
        await deleteNotification(id, user.uid);
      }
    } catch (error) {
      console.error(
        `Error ${
          action === "read" ? "marking as read" : "deleting"
        } notification:`,
        error
      );
    }
  };

  // Filter notifications based on tab, search and type filters
  const getFilteredNotifications = () => {
    if (!user?.uid) return [];
    return notifications?.filter((notification) => {
      // Filter by tab
      if (activeTab === "unread" && notification.viewed?.[user?.uid])
        return false;

      // Filter by search query
      if (
        searchQuery &&
        !notification.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !notification.message.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Filter by notification type
      if (
        selectedTypes.length > 0 &&
        !selectedTypes.includes(notification.type)
      ) {
        return false;
      }

      return true;
    });
  };

  if (notifications === null) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <h3 className="text-lg font-semibold">
            Could not fetch notifications
          </h3>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      </div>
    );
  }
  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications?.filter(
    (n) => !n.viewed[user?.uid!]
  ).length;

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">
          Stay updated with your workshop activities and status updates.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full md:w-auto"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">
              Unread{" "}
              {unreadCount && unreadCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {`(${unreadCount})`}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-60">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notifications..."
              className="pl-9 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuCheckboxItem
                checked={selectedTypes.includes(
                  NOTIFICATION_TYPES.NEW_REGISTRATION
                )}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedTypes([
                      ...selectedTypes,
                      NOTIFICATION_TYPES.NEW_REGISTRATION,
                    ]);
                  } else {
                    setSelectedTypes(
                      selectedTypes.filter(
                        (t) => t !== NOTIFICATION_TYPES.NEW_REGISTRATION
                      )
                    );
                  }
                }}
              >
                New Registration
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedTypes.includes(
                  NOTIFICATION_TYPES.WORKSHOP_REMINDER
                )}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedTypes([
                      ...selectedTypes,
                      NOTIFICATION_TYPES.WORKSHOP_REMINDER,
                    ]);
                  } else {
                    setSelectedTypes(
                      selectedTypes.filter(
                        (t) => t !== NOTIFICATION_TYPES.WORKSHOP_REMINDER
                      )
                    );
                  }
                }}
              >
                Workshop Reminders
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedTypes.includes(
                  NOTIFICATION_TYPES.CAPACITY_ALERT
                )}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedTypes([
                      ...selectedTypes,
                      NOTIFICATION_TYPES.CAPACITY_ALERT,
                    ]);
                  } else {
                    setSelectedTypes(
                      selectedTypes.filter(
                        (t) => t !== NOTIFICATION_TYPES.CAPACITY_ALERT
                      )
                    );
                  }
                }}
              >
                Capacity Alerts
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedTypes.includes(
                  NOTIFICATION_TYPES.FEEDBACK_RECEIVED
                )}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedTypes([
                      ...selectedTypes,
                      NOTIFICATION_TYPES.FEEDBACK_RECEIVED,
                    ]);
                  } else {
                    setSelectedTypes(
                      selectedTypes.filter(
                        (t) => t !== NOTIFICATION_TYPES.FEEDBACK_RECEIVED
                      )
                    );
                  }
                }}
              >
                Feedback
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedTypes.includes(
                  NOTIFICATION_TYPES.APPROVAL_REQUEST
                )}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedTypes([
                      ...selectedTypes,
                      NOTIFICATION_TYPES.APPROVAL_REQUEST,
                    ]);
                  } else {
                    setSelectedTypes(
                      selectedTypes.filter(
                        (t) => t !== NOTIFICATION_TYPES.APPROVAL_REQUEST
                      )
                    );
                  }
                }}
              >
                Approval Requests
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* <Button
            variant="outline"
            size="icon"
            onClick={fetchNotifications}
            title="Refresh notifications"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button> */}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
        >
          <CheckCheck className="mr-2 h-4 w-4" />
          Mark all as read
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={clearReadNotifications}
          disabled={
            notifications?.filter((n) => n.viewed[user?.uid!]).length === 0
          }
        >
          <X className="mr-2 h-4 w-4" />
          Clear read notifications
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === "all" ? "All Notifications" : "Unread Notifications"}
          </CardTitle>
          <CardDescription>
            {filteredNotifications?.length}{" "}
            {activeTab === "all" ? "total" : "unread"} notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {notifications === undefined ? (
              // Loading skeletons
              Array(5)
                .fill(null)
                .map((_, i) => (
                  <div key={i} className="flex items-start space-x-4 py-4">
                  
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[400px]" />
                      <Skeleton className="h-4 w-[100px]" />
                    </div>
                  </div>
                ))
            ) : filteredNotifications && filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onAction={handleNotificationAction}
                />
              ))
            ) : (
              <div className="py-8 text-center">
                <Bell className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-semibold">
                  No notifications found
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery || selectedTypes.length > 0
                    ? "Try changing your search or filter criteria"
                    : activeTab === "unread"
                    ? "You've read all your notifications"
                    : "You don't have any notifications yet"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
