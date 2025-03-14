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
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { v4 as uuidv4 } from "uuid";

interface RegistrationFormProps {
  workshop: WorkshopComponentProps;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedWorkshop: WorkshopComponentProps) => void;
  currentUser: {
    uid: string;
    email: string;
    displayName?: string;
  };
}

type FieldOption = string | { value: string; label: string };

export default function RegistrationForm({
  workshop,
  isOpen,
  onClose,
  onSuccess,
  currentUser,
}: RegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationSchema, setValidationSchema] = useState<any>(z.object({}));

  // Build the dynamic form schema based on workshop configuration
  useEffect(() => {
    let schemaObj: Record<string, any> = {};

    // Always include default fields if useDefaultRegistrationFields is true
    if (workshop.useDefaultRegistrationFields !== false) {
      schemaObj.fullName = z.string().min(2, "Full name is required");
      schemaObj.email = z.string().email("Invalid email address");
    }

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

    // Always require terms agreement if it exists
    // if (workshop.termsRequired) {
    //   schemaObj.agreeToTerms = z.boolean().refine((val) => val === true, {
    //     message: "You must agree to the terms and conditions",
    //   });
    // }

    setValidationSchema(z.object(schemaObj));
  }, [workshop]);

  // Initialize form with default values
  const form = useForm<Record<string, any>>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      // Add default fields if configured to use them
      ...(workshop.useDefaultRegistrationFields !== false && {
        fullName: currentUser.displayName || "",
        email: currentUser.email,
      }),
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
      // Add terms agreement checkbox if required
      // ...(workshop.termsRequired && { agreeToTerms: false }),
    },
  });

  // Handle form submission
  const onSubmit = async (data: any) => {
    setIsSubmitting(true);

    try {
      // Create a unique ID for this registration
      const registrationId = uuidv4();

      // Basic registration data
      const registrationData = {
        docID: registrationId,
        workshopId: workshop.docID,
        studentId: currentUser.uid,
        registeredAt: new Date().toISOString(),
        timestamp: Date.now(),
        status: workshop.requireApproval ? "pending" : "confirmed",
        // Store the student's basic info
        student: {
          uid: currentUser.uid,
          name:
            workshop.useDefaultRegistrationFields !== false
              ? data.fullName
              : currentUser.displayName || "",
          email: currentUser.email,
        },
        // Store all form responses
        formData: { ...data },
      };

      // Save the registration to Firestore
      const registrationRef = doc(db, "registrations", registrationId);
      await setDoc(registrationRef, registrationData);

      // Update the workshop with new registration counts
      const workshopRef = doc(db, "workshops", workshop.docID);

      // Determine if we're adding to waitlist or regular registrations
      const isWaitlist =
        workshop.registeredCount >= workshop.capacity &&
        workshop.enableWaitlist;

      if (isWaitlist) {
        // Add to waitlist
        await updateDoc(workshopRef, {
          waitlist: arrayUnion({
            docID: registrationId,
            studentId: currentUser.uid,
            name: data.fullName || currentUser.displayName || "",
            email: currentUser.email,
            timestamp: new Date().toISOString(),
          }),
          waitlistCount: increment(1),
        });

        // Update registration status to waitlist
        await updateDoc(registrationRef, {
          status: "waitlist",
          waitlistPosition: (workshop.waitlistCount || 0) + 1,
        });

        toast.success("You have been added to the waitlist!");
      } else {
        // Regular registration
        await updateDoc(workshopRef, {
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
                          readOnly
                          className="bg-gray-50"
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

            {/* Terms and conditions agreement if required */}
            {/* {workshop.termsRequired && (
              <FormField
                control={form.control}
                name="agreeToTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I agree to the workshop terms and conditions, and
                        consent to the collection of my personal data for
                        registration purposes.
                      </FormLabel>
                      {workshop.termsText && (
                        <FormDescription>{workshop.termsText}</FormDescription>
                      )}
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            )} */}

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
