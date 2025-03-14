"use client";

import { useState, useEffect, useContext } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrganizationSettings } from "./organization";
import { Context } from "@/lib/userContext";
import { toast } from "sonner";
import { updateProfile } from "firebase/auth";
import { db } from "@/lib/firebase/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export function GeneralSettings() {
  const { user } = useContext(Context);
  const [displayName, setDisplayName] = useState("");
  const [jobTitle, setJobTitle] = useState("Workshop Administrator");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Set display name from user auth object
    if (user.displayName) {
      setDisplayName(user.displayName);
    }

    // If displayName is null, isEditing should be true by default
    setIsEditing(!user?.displayName);

    // Fetch additional profile data from Firestore
    const fetchProfileData = async () => {
      try {
        const profileRef = doc(db, "profile", user.uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          const profileData = profileSnap.data();
          if (profileData.jobTitle) {
            setJobTitle(profileData.jobTitle);
          }
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: displayName,
      });

      // Save additional profile data to Firestore
      const profileRef = doc(db, "profile", user.uid);
      await setDoc(
        profileRef,
        {
          displayName: displayName,
          jobTitle: jobTitle,
          email: user.email,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      toast("Success", {
        description: "Profile updated successfully",
      });

      if (isEditing && displayName) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error", {
        description: "Failed to update profile",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            {isEditing || !user?.displayName ? (
              <Input
                id="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
              />
            ) : (
              <div className="flex items-center justify-between">
                <div className="py-2">{user.displayName}</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="py-2">{user?.email}</div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="job-title">Job Title</Label>
            <Input
              id="job-title"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleSaveProfile}
            disabled={loading || (isEditing && !displayName)}
          >
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
   
    </div>
  );
}
