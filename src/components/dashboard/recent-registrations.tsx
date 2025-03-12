import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import dayjs from "dayjs";

interface RegistrationData {
  id: string;
  studentName: string;
  studentAvatar: string | null;
  workshopTitle: string;
  date: string;
  status?: string; // Optional since it might not be in your data
}

interface RecentRegistrationsProps {
  registrations: RegistrationData[];
}

export function RecentRegistrations({
  registrations = [],
}: RecentRegistrationsProps) {
  if (!registrations || registrations.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 border rounded-lg">
        <p className="text-muted-foreground">No recent registrations found</p>
      </div>
    );
  }

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
        {registrations.map((registration) => {
          // Format date for display
          const formattedDate = dayjs(registration.date).format("MMM D, YYYY");

          // Determine status if not provided
          const status = registration.status || "Confirmed";

          // Get initials for avatar fallback
          const initials = registration.studentName
            .split(" ")
            .map((name) => name[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);

          return (
            <TableRow key={registration.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={
                        registration.studentAvatar ||
                        `/placeholder.svg?height=32&width=32`
                      }
                      alt={registration.studentName}
                    />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {registration.studentName}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>{registration.workshopTitle}</TableCell>
              <TableCell>{formattedDate}</TableCell>
              <TableCell>
                <Badge
                  variant={status === "Confirmed" ? "outline" : "secondary"}
                >
                  {status}
                </Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
