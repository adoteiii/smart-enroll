"use client";

import { useContext, useState } from "react";
import Link from "next/link";
import {
  Circle,
  Check,
  Trash2,
  Calendar,
  Users,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { FirebaseNotification } from "@/lib/componentprops";
import { Context } from "@/lib/userContext";

// Initialize dayjs plugins
dayjs.extend(relativeTime);

interface NotificationItemProps {
  notification: FirebaseNotification;
  onAction: (id: string, action: "read" | "delete") => void;
}

export function NotificationItem({
  notification,
  onAction,
}: NotificationItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const {user} = useContext(Context)

  
  const getIcon = () => {
    switch (notification.type) {
      case "new-registration":
        return <Users className="h-5 w-5 text-primary" />;
      case "workshop-reminder":
        return <Calendar className="h-5 w-5 text-amber-500" />;
      case "capacity-alert":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case "feedback-received":
        return <MessageSquare className="h-5 w-5 text-violet-500" />;
      case "approval-request":
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <Circle className="h-5 w-5" />;
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAction(notification.id, "read");
    toast.success("Notification marked as read");
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAction(notification.id, "delete");
    toast.success("Notification removed");
  };

  // Get relative time (e.g., "2 hours ago")
  const getRelativeTime = () => {
    if (!notification.createdAt) return "";

    const date = notification.createdAt;
    return dayjs(date).fromNow();
  };
  if (!user?.uid) return null;
  return (
    <div
      className={`flex items-start space-x-4 p-4 rounded-md transition-colors hover:bg-muted/50 relative ${
        !notification.viewed[user.uid] ? "bg-muted/30" : ""
      }`}

      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      
      <div className="mt-1">
        {!notification.viewed[user.uid] && (
          <div className="absolute left-2 top-5 h-2 w-2 rounded-full bg-primary" />
        )}
        <div className="p-2 rounded-full bg-muted">{getIcon()}</div>
      </div>

      <div className="flex-1">
        <Link href={notification.link || "#"} className="block">
          <h4 className="text-sm font-semibold leading-none mb-1">
            {notification.title}
          </h4>
          <p className="text-sm text-muted-foreground">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {getRelativeTime()}
          </p>
        </Link>
      </div>

      <div
        className={`flex space-x-1 transition-opacity ${
          isHovered || notification.viewed[user.uid] ? "opacity-100" : "opacity-0"
        }`}
      >
        
        {!notification.viewed[user.uid] && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleMarkAsRead}
            title="Mark as read"
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={handleDelete}
          title="Delete notification"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
