import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users } from "lucide-react";
import { WorkshopComponentProps } from "@/lib/componentprops";
import dayjs from "dayjs";
import Link from "next/link";

interface UpcomingWorkshopsProps {
  workshops: WorkshopComponentProps[];
}

export function UpcomingWorkshops({ workshops = [] }: UpcomingWorkshopsProps) {
  // If no workshops are provided, return a message
  if (!workshops || workshops.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 border rounded-lg">
        <p className="text-muted-foreground">No upcoming workshops scheduled</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {workshops.map((workshop) => {
        // Calculate the status based on registration count and capacity
        const registeredCount = workshop.registeredCount || 0;
        const capacity = workshop.capacity || 0;
        const percentFull =
          capacity > 0 ? (registeredCount / capacity) * 100 : 0;

        let status = "Open";
        if (percentFull >= 90) status = "Almost Full";
        if (percentFull >= 100) status = "Filled";

        // Format date and time
        const startDate = dayjs(workshop.startDate);
        const endDate = dayjs(workshop.endDate);
        const formattedDate = startDate.format("MMM D, YYYY");
        const formattedTime = `${startDate.format("h:mm A")} - ${endDate.format(
          "h:mm A"
        )}`;

        return (
          <div
            key={workshop.id}
            className="flex flex-col space-y-2 rounded-lg border p-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{workshop.title}</h3>
              <Badge
                variant={
                  status === "Almost Full"
                    ? "secondary"
                    : status === "Filled"
                    ? "destructive"
                    : "outline"
                }
              >
                {status}
              </Badge>
            </div>
            <div className="flex flex-col space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                {formattedDate}
              </div>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                {formattedTime}
              </div>
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                {registeredCount}/{capacity} Registered
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Link href={`/dashboard/workshops/${workshop.docID}`}>
                <Button variant="outline" size="sm">
                  Details
                </Button>
              </Link>
              
            </div>
          </div>
        );
      })}
    </div>
  );
}
