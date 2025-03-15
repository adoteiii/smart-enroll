"use client";

import React, { useState, useContext, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { v4 } from "uuid";
import Loader from "../loader/Loader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Context } from "@/lib/userContext";
import { useAppSelector } from "@/redux/store";
import {
  writeToBatch,
  createWriteBatch,
  updateBatch,
  commitBatch,
} from "@/lib/firebase/firestore";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { OrganizationFormData } from "@/lib/componentprops";
import { ImageUpload } from "./ImageUpload";
import Link from "next/link";
import { Umbrella } from "lucide-react";
import { SettingsOrganizationTable } from "./SettingsOrganizationTable";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function OrganizationSettings() {
  const { user } = useContext(Context);
  const organization = useAppSelector(
    (state) => state.OrganizationReducer.value
  );
  const dbuser = useAppSelector((state) => state.DBUserReducer.value);
  const team = useAppSelector((state) => state.TeamReducer.value);
  const teamrequests = useAppSelector(
    (state) => state.TeamRequestReducer.value
  );

  const [phone, setPhone] = useState("+233 ");
  const [loading, setLoading] = useState(false);
  const [organizationName, setOrganizationName] = useState("");
  const [organizationDescription, setOrganizationDescription] = useState("");
  const [organizationAddress, setOrganizationAddress] = useState("");
  const [organizationCountry, setOrganizationCountry] = useState("Ghana");
  const [userConsent, setUserConsent] = useState(false);
  const [organizationLogo, setOrganizationLogo] = useState(["", ""]);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [joinOrganization, setJoinOrganization] = useState("");
  const [joinOrganizationLoading, setJoinOrganizationLoading] = useState("");
  const [addOrganization, setAddOrganization] = useState(false);

  useEffect(() => {
    // If user exists but no dbuser record exists yet, create one as admin
    if (user?.uid && dbuser === null) {
      setDoc(
        doc(db, "dbuser", user.uid),
        {
          uid: user.uid,
          role: "ADMIN", // Set all users as admin by default
          email: user.email,
          createdAt: Date.now(),
        },
        { merge: true }
      )
        .then(() => {
          console.log("Created default admin dbuser");
        })
        .catch((err) => {
          console.error("Failed to create default admin dbuser:", err);
        });
    }
  }, [user, dbuser]);

  useEffect(() => {
    console.log("Organization state:", organization);
  }, [organization]);

  useEffect(() => {
    if (organization) {
      setOrganizationLogo([
        organization?.logoFileName || "",
        organization?.logoUrl || "",
      ]);
    }
  }, [organization]);

  const handlePhone = (val: string) => {
    const initial = val.substring(0, 5);
    if (initial === "+233 ") {
      const remainder = val.substring(5, undefined);
      const isNumber = remainder.length < 10 && /^\d+$/.test(remainder);
      if (isNumber) {
        setPhone(val);
      }
    }
  };

  const submitOrganizationDetails = () => {
    if (!user?.uid) {
      return;
    }

    // validate data manually
    if (organizationName.length < 3) {
      toast.error("Error", {
        description: "Organization name must be greater than 3 letters",
      });
      return;
    }
    if (phone.length !== 9 + 5) {
      toast.error("Error", {
        description: "Enter a valid organization phone",
      });
      return;
    }

    if (organizationCountry.length < 1) {
      toast.error("Error", {
        description: "Enter a valid organization country",
      });
      return;
    }

    if (organizationAddress.length < 1) {
      toast.error("Error", {
        description: "Enter a valid organization address",
      });
      return;
    }

    if (organizationAddress.length < 6) {
      toast.error("Error", {
        description: "Enter a valid digital address",
      });
      return;
    }
    const batch = createWriteBatch();
    const data: OrganizationFormData = {
      name: organizationName,
      phone: phone,
      digitalAddress: organizationAddress,
      country: organizationCountry,
      dateSubmitted: Date.now(),
      creator: user.uid,
      customRate: 0.05, // default is now 14%
      logoUrl: organizationLogo?.[1] || "",
      logoFileName: organizationLogo?.[0],
      dbusers: [user.uid],
    };
    const document = v4();
    setLoading(true);

    try {
      updateBatch(batch, "dbuser", user.uid, {
        organizationid: document,
        role: "ADMIN",
      });
      writeToBatch(batch, "organization", document, data);

      batch
        .commit()
        .then(() => {
          toast("Success", {
            description: "Organization details added successfully",
          });
          setLoading(false);
          setOrganizationAddress("");
          setOrganizationName("");
          setPhone("+233 ");
          setOrganizationDescription("");
          setUserConsent(false);
        })
        .catch((err) => {
          console.log(err);
          toast("Error", { description: "Failed to add organization details" });
          setLoading(false);
        });
    } catch (err) {
      console.log(err);
      toast("Error", {
        description: "An error occurred",
      });
      setLoading(false);
    }
  };

  const handleLogoChange = (logoData: [string, string]) => {
    setOrganizationLogo(logoData);
    setErrorDetails(null);
  };

  const updateOrganizationLogo = async ({
    fp,
    url,
  }: {
    fp: string;
    url: string;
  }) => {
    if (!organization || !user?.uid) {
      console.error("Missing organization or user data");
      setErrorDetails("Missing organization or user data");
      return;
    }

    setLoading(true);
    setErrorDetails(null);

    try {
      const docId = organization.name.toUpperCase().split(" ").join("-");
      await updateDoc(doc(db, "organization", docId), {
        logoUrl: url,
        logoFileName: fp,
      });

      toast("Success", {
        description: "Organization logo updated successfully",
      });
    } catch (error) {
      console.error("Error updating organization logo:", error);

      let errorMessage = "Failed to update organization logo";
      if ((error as any).code) {
        errorMessage += ` ${(error as any).code}`;
      }
      if (error instanceof Error && error.message) {
        errorMessage += ` ${error.message}`;
      }

      setErrorDetails(errorMessage);

      toast.error("Error", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  if (organization === undefined) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Organization Management</h3>
        <p className="text-sm text-muted-foreground">
          Manage your organization details and team members.
        </p>
      </div>
      {organization === null ? (
        <div id="organization" className="space-y-8 mt-8">
          <h2 className="text-2xl font-semibold">Your Organization</h2>
          {!dbuser?.organizationid ? (
            <div className="space-y-4">
              <Card className="border-x-0 rounded-none shadow-none px-0">
                <CardHeader className="px-0">
                  <CardTitle>Organization Options</CardTitle>
                  <CardDescription>
                    Choose how you want to proceed
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 px-0">
                  <div className="flex items-center justify-between space-x-4">
                    <div className="flex-1 space-y-1">
                      <h4 className="text-sm font-semibold">
                        Create Organization
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Start a new organization as an administrator
                      </p>
                    </div>
                    <Switch
                      checked={addOrganization}
                      onCheckedChange={setAddOrganization}
                      disabled={loading}
                    />
                  </div>
                  {addOrganization && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="organization-name">
                            Organization Name
                          </Label>
                          <Input
                            id="organization-name"
                            value={organizationName}
                            onChange={(e) =>
                              setOrganizationName(
                                e.target.value.replace(/[^a-zA-Z0-9\s]/g, "")
                              )
                            }
                            placeholder="Enter organization name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="organization-description">
                            Organization Description
                          </Label>
                          <Input
                            id="organization-description"
                            value={organizationDescription}
                            onChange={(e) =>
                              setOrganizationDescription(e.target.value)
                            }
                            placeholder="Eg. Empowering Men and Women in Technology"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="organization-phone">
                            Organization Phone{" "}
                            <span className="text-xs">
                              --Do not include the leading zero
                            </span>
                          </Label>
                          <Input
                            id="organization-phone"
                            value={phone}
                            onChange={(e) => handlePhone(e.target.value)}
                            placeholder="+233 "
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="organization-address">
                            Digital Address
                          </Label>
                          <Input
                            id="organization-address"
                            value={organizationAddress}
                            onChange={(e) =>
                              setOrganizationAddress(e.target.value)
                            }
                            placeholder="Enter digital address"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="organization-country">Country</Label>
                          <Input
                            id="organization-country"
                            value={organizationCountry}
                            disabled
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="organization-logo">
                            Organization Logo (Optional)
                          </Label>
                          <ImageUpload
                            relativePath={`${user?.uid}/organization/${v4()}`}
                            value={organizationLogo}
                            onUploadComplete={(fp, url) => {
                              handleLogoChange([fp, url]);
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="terms"
                          checked={userConsent}
                          onCheckedChange={setUserConsent}
                        />
                        <Label htmlFor="terms" className="text-sm">
                          By submitting this form, you agree that all
                          information entered is correct and you agree to the{" "}
                          <Link href="#" className="font-semibold text-primary">
                            Terms and Conditions
                          </Link>
                        </Label>
                      </div>

                      <Button
                        onClick={submitOrganizationDetails}
                        disabled={
                          phone.length !== 14 ||
                          organizationName.length < 2 ||
                          organizationDescription.length < 1 ||
                          organizationAddress.length < 6 ||
                          !userConsent ||
                          loading
                        }
                      >
                        Add Organization Details
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center justify-between space-x-4">
                    <div className="flex-1 space-y-1">
                      <h4 className="text-sm font-semibold">
                        Join Organization
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Join an existing organization as a member
                      </p>
                    </div>
                    <Switch
                      checked={!addOrganization}
                      onCheckedChange={(checked) =>
                        setAddOrganization(!checked)
                      }
                      disabled={loading}
                    />
                  </div>
                  {!addOrganization && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="organization-id">
                            Organization ID
                          </Label>
                          <div className="flex gap-2 items-center">
                            <div className="flex-1">
                              <Input
                                id="organization-id"
                                placeholder="Enter organization ID"
                                className="w-full"
                                value={joinOrganization}
                                onChange={(e) =>
                                  setJoinOrganization(e.target.value)
                                }
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  "w-3 h-3 rounded-full bg-red-500",
                                  joinOrganization.length > 5 && "bg-green-500"
                                )}
                              />
                              <Button
                                onClick={(e) => {
                                  e.preventDefault();
                                  // join organization
                                  const batch = createWriteBatch();
                                  updateBatch(batch, "dbuser", user.uid, {
                                    organizationid: joinOrganization,
                                  });
                                  commitBatch(batch)
                                    .then(() => {
                                      toast("Success", {
                                        description:
                                          "Organization join request sent",
                                      });
                                    })
                                    .catch(() => {
                                      toast("Error", {
                                        description:
                                          "Failed to join organization",
                                      });
                                    });
                                }}
                                disabled={loading || !joinOrganization}
                              >
                                Join Organization
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Enter the organization ID provided by your
                            administrator
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="border-x-0 rounded-none shadow-none px-0">
              <CardHeader className="px-0">
                <CardTitle className="flex items-center gap-2">
                  <Umbrella className="h-5 w-5 text-yellow-500" />
                  Organization Join Request Pending
                </CardTitle>
                <CardDescription>
                  Your request to join an organization is being reviewed by
                  administrators. You will be notified once your request has
                  been processed.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="animate-pulse h-2 w-2 rounded-full bg-yellow-500"></div>
                  <span>Waiting for approval</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <SettingsOrganizationTable
          organization={organization}
          users={team}
          userrequests={teamrequests}
          updateOrganizationLogo={updateOrganizationLogo}
          updateUserRole={async (userId: string, role: string) => {
            const batch = createWriteBatch();
            // cannot update himself
            console.log(
              "user",
              user.uid,
              "userId",
              userId,
              userId === user.uid
            );
            if (userId === user.uid) {
              throw new Error("Cannot update your own role");
            }
            // toast({ title: "Cannot update your own role", variant: "destructive" });
            updateBatch(batch, "dbuser", userId, { role });
            await commitBatch(batch);
          }}
        />
      )}
    </div>
  );
}
