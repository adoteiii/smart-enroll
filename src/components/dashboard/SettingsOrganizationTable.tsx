import { use, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MdUmbrella } from "react-icons/md";
import { ImageUpload } from "./ImageUpload";
import { v4 } from "uuid";
import { DBUSER } from "@/lib/types";
import { Copy } from "lucide-react";
import { useAppSelector } from "@/redux/store";
import { format } from "date-fns";
import {
  commitBatch,
  createWriteBatch,
  updateBatch,
  writeToDoc,
} from "@/lib/firebase/firestore";
import { or } from "firebase/firestore";
import Image from "next/image";
import { OrganizationFormData } from "@/lib/componentprops";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { toast } from "sonner";
// import { toast } from "@";

export function TeamRequestsSection({
  requests,
  onAccept,
  onReject,
}: {
  requests: DBUSER[] | null | undefined;
  onAccept: (requestId: string) => Promise<void>;
  onReject: (requestId: string) => Promise<void>;
}) {
  const [loadingId, setLoadingId] = useState<string>("");

  const handleAction = async (
    requestId: string,
    action: "accept" | "reject"
  ) => {
    setLoadingId(requestId);
    try {
      await (action === "accept" ? onAccept(requestId) : onReject(requestId));
      toast(`Request ${action}ed successfully`);
    } catch (error) {
      toast.error(`Failed to ${action} request`);
    } finally {
      setLoadingId("");
    }
  };

  if (requests === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (requests === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
        <div className="text-lg font-medium text-gray-600">
          Unable to load team requests
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Requests</CardTitle>
        <CardDescription>Manage pending team join requests</CardDescription>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No pending requests
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Requested On</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.uid}>
                  <TableCell>{request.displayName}</TableCell>
                  <TableCell>{request.email}</TableCell>
                  <TableCell>{format(new Date(), "PPp")}</TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleAction(request.uid, "accept")}
                      disabled={loadingId === request.uid}
                    >
                      {loadingId === request.uid ? "Processing..." : "Accept"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleAction(request.uid, "reject")}
                      disabled={loadingId === request.uid}
                    >
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

export function SettingsOrganizationTable({
  organization,
  users,
  userrequests,
  updateOrganizationLogo,
  updateUserRole,
}: {
  organization: OrganizationFormData | undefined;
  users: DBUSER[] | undefined | null;
  userrequests: DBUSER[] | undefined | null;
  updateOrganizationLogo: (data: { fp: string; url: string }) => Promise<void>;
  updateUserRole: (userId: string, role: string) => Promise<void>;
}) {
  const [loading, setLoading] = useState<string>("");
  const dbuser = useAppSelector((state) => state.DBUserReducer.value);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setLoading(userId);
      await updateUserRole(userId, newRole);
      toast.error("Role updated successfully");
    } catch (error) {
      toast.error("Failed to update role");
    } finally {
      setLoading("");
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    if (!organization || !dbuser?.organizationid) {
      toast.error("Organization ID not found");
      return;
    }
    const batch = createWriteBatch();
    updateBatch(batch, "organization", dbuser?.organizationid, {
      dbusers: [...organization.dbusers, requestId],
    });
    await commitBatch(batch);
  };

  const handleRejectRequest = async (requestId: string) => {
    if (!organization || !dbuser?.organizationid) {
      toast.error("Organization ID not found");
      return;
    }
    const batch = createWriteBatch();
    updateBatch(batch, "dbuser", requestId, { organizationid: "" });
    // updateBatch(batch, 'organization', dbuser?.organizationid, {dbusers: organization.dbusers.filter((uid: string) => uid !== requestId)})
    await commitBatch(batch);
  };

  if (users === undefined && dbuser?.role === "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (users === null && dbuser?.role === "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
        <div className="text-lg font-medium text-gray-600">
          Unable to load team members
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  if (dbuser?.role === "ADMIN") {
    return (
      <Card className="px-0 border-none shadow-none">
        <CardHeader className="px-0">
          <div className="flex items-center gap-3">
            <CardTitle className="text-2xl font-bold">Organization</CardTitle>
            <MdUmbrella size={24} className="text-primary" />
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <div className="flex items-center gap-4">
            <Image
              alt="Organization image"
              className="w-12 h-12"
              width={500}
              height={500}
              src={organization?.logoUrl || ""}
            ></Image>
            <h1 className="text-2xl font-bold">{organization?.name}</h1>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground">
                Your Role:
              </Label>
              <Badge className="font-medium text-sm">{dbuser?.role}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (dbuser?.role === "USER") {
    return (
      <div>
        <Card className="px-0 border-none shadow-none">
          <CardHeader className="px-0">
            <div className="flex items-center gap-3">
              <CardTitle className="text-2xl font-bold">Organization</CardTitle>
              <MdUmbrella size={24} className="text-primary" />
            </div>
          </CardHeader>
          <CardContent className="px-0">
            <div className="flex items-center gap-4">
              <Image
                alt="Organization image"
                className="w-12 h-12"
                width={500}
                height={500}
                src={organization?.logoUrl || ""}
              ></Image>
              <h1 className="text-2xl font-bold">{organization?.name}</h1>
            </div>
            <div className="mt-4">
              <div className="flex items-center gap-2">
                <Label className="text-sm text-muted-foreground">
                  Your Role:
                </Label>
                <Badge className="font-medium text-sm">{dbuser?.role}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Team Members</CardTitle>

            <Button
              onClick={() => {
                if (!dbuser?.organizationid) {
                  toast.error("Organization ID not found");
                  return;
                }
                window.navigator?.clipboard
                  ?.writeText(dbuser?.organizationid)
                  .then(() => {
                    toast("Organization ID copied to clipboard");
                  })
                  .catch(() => {
                    toast.error("Failed to copy Organization ID");
                  });
              }}
            >
              <Copy></Copy>Copy Organization ID
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  {/* <TableHead className="w-[100px]">Actions</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell>{user.displayName || user?.email}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="px-0 border-none shadow-none">
        <CardHeader className="px-0">
          <div className="flex items-center gap-3">
            <CardTitle className="text-2xl font-bold">
              {organization?.name}
            </CardTitle>
            <MdUmbrella size={24} className="text-primary" />
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="organization-logo">Organization Logo</Label>
              <div className="max-w-xl">
                <ImageUpload
                  relativePath={`${organization?.docID}/logo/${v4()}`}
                  value={[
                    organization?.logoFileName || "",
                    organization?.logoUrl || "",
                  ]}
                  onUploadComplete={(fp, url) =>
                    updateOrganizationLogo({ fp, url })
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <TeamRequestsSection
        requests={userrequests}
        onAccept={handleAcceptRequest}
        onReject={handleRejectRequest}
      />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Team Members</CardTitle>
          <Button
            onClick={() => {
              if (!dbuser?.organizationid) {
                toast.error("Organization ID not found");
                return;
              }
              window.navigator?.clipboard
                ?.writeText(dbuser?.organizationid)
                .then(() => {
                  toast("Organization ID copied to clipboard");
                })
                .catch(() => {
                  toast("Failed to copy Organization ID");
                });
            }}
          >
            <Copy></Copy>Copy Organization ID
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((dbuser_i) => (
                <TableRow key={dbuser_i.uid}>
                  <TableCell>
                    {dbuser_i.displayName || dbuser_i?.email}
                  </TableCell>
                  <TableCell>{dbuser_i.email}</TableCell>
                  <TableCell>
                    <Select
                      value={dbuser_i.role}
                      onValueChange={(value) =>
                        handleRoleChange(dbuser_i.uid, value)
                      }
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="MANAGER">Manager</SelectItem>
                        <SelectItem value="SALES">Sales</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {loading === dbuser_i.uid ? (
                      <Button variant="ghost" disabled>
                        Updating...
                      </Button>
                    ) : (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            Remove
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Remove Team Member</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to remove this team member?
                              This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex justify-end space-x-2">
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button
                              variant="destructive"
                              onClick={async () => {
                                // Handle user removal here
                                if (dbuser?.uid === dbuser_i.uid) {
                                  toast.error("Cannot remove yourself");
                                  return;
                                }

                                if (!organization?.docID) {
                                  toast.error("Organization ID not found");
                                  return;
                                }
                                const batch = createWriteBatch();
                                updateBatch(
                                  batch,
                                  "organization",
                                  organization?.docID,
                                  {
                                    dbusers: organization?.dbusers.filter(
                                      (uid) => uid !== dbuser_i.uid
                                    ),
                                  }
                                );
                                await commitBatch(batch);
                                toast("Team member removed successfully", {
                                  description:
                                    "The user has been removed from your organization.",
                                });
                              }}
                            >
                              Remove User
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
