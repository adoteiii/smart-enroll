"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import {
  FormField as CustomFormField,
  WorkshopComponentProps,
} from "@/lib/componentprops";
import {
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
  increment,
  serverTimestamp,
  or,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { v4 as uuidv4 } from "uuid";
import { createRegistrationNotification } from "@/lib/firebase/notifications";
import { createWriteBatch } from "@/lib/firebase/firestore";

interface RegistrationFormProps {
  workshop: WorkshopComponentProps;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedWorkshop: WorkshopComponentProps) => void;
}

type FieldOption = string | { value: string; label: string };

export default function RegistrationForm({
  workshop,
  isOpen,
  onClose,
  onSuccess,
}: RegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationSchema, setValidationSchema] = useState<any>(z.object({}));

  // Build the dynamic form schema based on workshop configuration
  useEffect(() => {
    let schemaObj: Record<string, any> = {};

    // Always include default fields for name and email regardless of settings
    schemaObj.fullName = z.string().min(2, "Full name is required");
    schemaObj.email = z.string().email("Invalid email address");

    // Add custom fields from workshop configuration
    if (workshop.customRegistrationFields?.length) {
      workshop.customRegistrationFields.forEach((field) => {
        if (!field.id) return; // Skip fields without id

        let fieldValidation;

        switch (field.type) {
          case "text":
          case "textarea":
            fieldValidation = field.required
              ? z.string().min(1, `${field.label} is required`)
              : z.string().optional();
            break;
          case "email":
            fieldValidation = field.required
              ? z.string().email(`Please enter a valid email address`)
              : z
                  .string()
                  .email(`Please enter a valid email address`)
                  .optional();
            break;
          case "number":
            fieldValidation = field.required
              ? z.string().refine((val) => !isNaN(Number(val)), {
                  message: `${field.label} must be a number`,
                })
              : z
                  .string()
                  .refine((val) => !val || !isNaN(Number(val)), {
                    message: `${field.label} must be a number`,
                  })
                  .optional();
            break;
          case "select":
            fieldValidation = field.required
              ? z.string().min(1, `Please select a ${field.label}`)
              : z.string().optional();
            break;
          case "checkbox":
            if (field.options && field.options.length > 0) {
              // For checkbox groups (multiple options)
              fieldValidation = field.required
                ? z
                    .array(z.string())
                    .min(1, `Please select at least one ${field.label}`)
                : z.array(z.string()).optional();
            } else {
              // For single checkbox (boolean)
              fieldValidation = field.required
                ? z.boolean().refine((val) => val === true, {
                    message: `${field.label} is required`,
                  })
                : z.boolean().optional();
            }
            break;
          case "radio":
            fieldValidation = field.required
              ? z.string().min(1, `Please select a ${field.label}`)
              : z.string().optional();
            break;
          default:
            fieldValidation = z.string().optional();
        }

        schemaObj[field.id] = fieldValidation;
      });
    }

    setValidationSchema(z.object(schemaObj));
  }, [workshop]);

  // Initialize form with empty values
  const form = useForm<Record<string, any>>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      // Default empty fields for name and email
      fullName: "",
      email: "",
      // Add custom fields with their default values
      ...(workshop.customRegistrationFields?.reduce((acc, field) => {
        if (field.id) {
          if (
            field.type === "checkbox" &&
            field.options &&
            field.options.length > 0
          ) {
            // For checkbox groups, default to empty array
            acc[field.id] = field.defaultValue || [];
          } else {
            acc[field.id] = field.defaultValue || "";
          }
        }
        return acc;
      }, {} as Record<string, any>) || {}),
    },
  });

  // Handle form submission
  const onSubmit = async (data: any) => {
    setIsSubmitting(true);

    try {
      // Create a unique ID for this registration
      const registrationId = uuidv4();
      const batch = createWriteBatch();
      // Generate a unique guest ID for this registration
      const guestId = `guest-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}`;

      // Basic registration data
      const registrationData = {
        docID: registrationId,
        workshopId: workshop.docID,
        registeredAt: new Date().toISOString(),
        timestamp: Date.now(),
        status: workshop.requireApproval ? "pending" : "confirmed",
        // Store the student's info directly from form data
        student: {
          uid: guestId, // Use the generated guest ID
          name: data.fullName,
          email: data.email,
        },
        // Store all form responses
        formData: { ...data },
      };

      // Save the registration to Firestore
      const registrationRef = doc(db, "registrations", registrationId);
      batch.set(registrationRef, registrationData);

      // Update the workshop with new registration counts
      const workshopRef = doc(db, "workshops", workshop.docID);

      // Determine if we're adding to waitlist or regular registrations
      const isWaitlist =
        workshop.registeredCount >= workshop.capacity &&
        workshop.enableWaitlist;

      if (isWaitlist) {
        // Add to waitlist
        batch.update(workshopRef, {
          waitlist: arrayUnion({
            docID: registrationId,
            name: data.fullName,
            email: data.email,
            timestamp: new Date().toISOString(),
          }),
          waitlistCount: increment(1),
        });

        // Update registration status to waitlist
        batch.update(registrationRef, {
          status: "waitlist",
          waitlistPosition: (workshop.waitlistCount || 0) + 1,
        });

        toast.success("You have been added to the waitlist!");
      } else {
        // Regular registration
        batch.update(workshopRef, {
          registeredCount: increment(1),
        });

        toast.success("Successfully registered for the workshop!");
      }

      // Create an updated workshop object to return
      const updatedWorkshop = {
        ...workshop,
        registeredCount: isWaitlist
          ? workshop.registeredCount
          : workshop.registeredCount + 1,
        waitlistCount: isWaitlist
          ? (workshop.waitlistCount || 0) + 1
          : workshop.waitlistCount,
      };

      // Create a registration notification
      await createRegistrationNotification(
        workshop.docID, // The admin who created the workshop
        `${data.fullName}`, // Student name
        workshop.docID, // Workshop ID
        workshop.title, // Workshop title
        workshop.organization, // Organization ID,
        registrationData.student,
        batch
      );
      await batch.commit()

      onSuccess(updatedWorkshop);
      onClose();
    } catch (error) {
      console.error("Error registering for workshop:", error);
      toast.error("Failed to register for the workshop. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render form fields based on field type
  const renderFormField = (field: CustomFormField) => {
    if (!field.id) return null;

    switch (field.type) {
      case "text":
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.label} {field.required && "*"}
                </FormLabel>
                <FormControl>
                  <Input placeholder={field.placeholder || ""} {...formField} />
                </FormControl>
                {field.description && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "email":
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.label} {field.required && "*"}
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={field.placeholder || "email@example.com"}
                    {...formField}
                  />
                </FormControl>
                {field.description && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "number":
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.label} {field.required && "*"}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={field.placeholder || ""}
                    {...formField}
                  />
                </FormControl>
                {field.description && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "textarea":
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.label} {field.required && "*"}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={field.placeholder || ""}
                    className="resize-none"
                    {...formField}
                  />
                </FormControl>
                {field.description && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "select":
        if (!field.options?.length) return null;

        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.label} {field.required && "*"}
                </FormLabel>
                <Select
                  onValueChange={formField.onChange}
                  defaultValue={formField.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          field.placeholder || `Select ${field.label}`
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {field.options?.map((option, i) => {
                      // Handle both string and object options
                      const optionValue =
                        typeof option === "string" ? option : option.value;
                      const optionLabel =
                        typeof option === "string" ? option : option.label;

                      return (
                        <SelectItem
                          key={`${optionValue || i}`}
                          value={optionValue}
                        >
                          {optionLabel}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {field.description && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "checkbox":
        // If options are provided, render a checkbox group
        if (field.options && field.options.length > 0) {
          return (
            <FormField
              key={field.id}
              control={form.control}
              name={field.id}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>
                    {field.label} {field.required && "*"}
                  </FormLabel>
                  <div className="space-y-2">
                    {field.options?.map((option, i) => {
                      // Handle both string and object options
                      const optionValue =
                        typeof option === "string" ? option : option.value;
                      const optionLabel =
                        typeof option === "string" ? option : option.label;

                      return (
                        <div
                          key={`${optionValue || i}`}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            checked={formField.value?.includes(optionValue)}
                            onCheckedChange={(checked) => {
                              const currentValues = formField.value || [];
                              const updatedValues = checked
                                ? [...currentValues, optionValue]
                                : currentValues.filter(
                                    (val: string) => val !== optionValue
                                  );
                              formField.onChange(updatedValues);
                            }}
                          />
                          <FormLabel className="font-normal">
                            {optionLabel}
                          </FormLabel>
                        </div>
                      );
                    })}
                  </div>
                  {field.description && (
                    <FormDescription>{field.description}</FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        }

        // Otherwise, render a single checkbox
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                <FormControl>
                  <Checkbox
                    checked={formField.value}
                    onCheckedChange={formField.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    {field.label} {field.required && "*"}
                  </FormLabel>
                  {field.description && (
                    <FormDescription>{field.description}</FormDescription>
                  )}
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        );

      case "radio":
        if (!field.options?.length) return null;

        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.label} {field.required && "*"}
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={formField.onChange}
                    defaultValue={formField.value}
                    className="flex flex-col space-y-1"
                  >
                    {field.options?.map((option, i) => {
                      // Handle both string and object options
                      const optionValue =
                        typeof option === "string" ? option : option.value;
                      const optionLabel =
                        typeof option === "string" ? option : option.label;

                      return (
                        <div
                          key={`${optionValue || i}`}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            value={optionValue}
                            id={`${field.id}-${optionValue || i}`}
                          />
                          <FormLabel
                            className="font-normal"
                            htmlFor={`${field.id}-${optionValue || i}`}
                          >
                            {optionLabel}
                          </FormLabel>
                        </div>
                      );
                    })}
                  </RadioGroup>
                </FormControl>
                {field.description && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register for Workshop</DialogTitle>
          <DialogDescription>
            Please fill in the following details to register for "
            {workshop.title}".
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Default registration fields if enabled */}
            {workshop.useDefaultRegistrationFields !== false && (
              <>
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your email address"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Add phone field to match DEFAULT_FIELDS in StudentRegistration */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your phone number"
                          type="tel"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        How we can contact you regarding the workshop
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Custom form fields */}
            {workshop.customRegistrationFields?.map(renderFormField)}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Registering..." : "Complete Registration"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
