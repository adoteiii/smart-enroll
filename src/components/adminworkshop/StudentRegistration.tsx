"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import {
  FieldType,
  FormField,
  WorkshopComponentProps,
  FieldOption,
} from "@/lib/componentprops";
import { toast } from "sonner";

interface StudentRegistrationProps {
  workshop: Partial<WorkshopComponentProps>;
  onChange: (field: string, value: any) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onContinue?: () => void;
  isEditing?: boolean;
}

// Sortable field item component
const SortableFieldItem = ({
  field,
  onEdit,
  onDelete,
}: {
  field: FormField;
  onEdit: (field: FormField) => void;
  onDelete: (id: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-3 bg-white dark:bg-gray-950 border rounded-md mb-2"
    >
      <div {...attributes} {...listeners} className="cursor-grab">
        <GripVertical className="h-5 w-5 text-gray-400" />
      </div>

      <div className="flex-1">
        <div className="flex items-center">
          <span className="font-medium">{field.label}</span>
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </div>
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <span className="capitalize bg-gray-100 dark:bg-gray-800 text-xs px-2 py-0.5 rounded">
            {field.type}
          </span>
          {field.description && (
            <span className="text-xs">• {field.description}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button size="icon" variant="ghost" onClick={() => onEdit(field)}>
          <ChevronDown className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => onDelete(field.id)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// Field editor component
const FieldEditor = ({
  field,
  onUpdate,
  onCancel,
}: {
  field: FormField;
  onUpdate: (field: FormField) => void;
  onCancel: () => void;
}) => {
  const [editedField, setEditedField] = useState<FormField>({ ...field });
  const [newOption, setNewOption] = useState("");

  const handleOptionAdd = () => {
    if (!newOption.trim()) return;

    // Create a proper FieldOption when adding new options
    const newFieldOption: FieldOption = newOption.trim();

    setEditedField((prev) => ({
      ...prev,
      options: [...(prev.options || []), newFieldOption],
    }));

    setNewOption("");
  };

  const handleOptionRemove = (index: number) => {
    setEditedField((prev) => ({
      ...prev,
      options: (prev.options || []).filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-900 mb-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="field-label">Field Label</Label>
          <Input
            id="field-label"
            value={editedField.label}
            onChange={(e) =>
              setEditedField({ ...editedField, label: e.target.value })
            }
            placeholder="Enter field label"
          />
        </div>

        <div>
          <Label htmlFor="field-type">Field Type</Label>
          <Select
            value={editedField.type}
            onValueChange={(value) =>
              setEditedField({
                ...editedField,
                type: value as FieldType,
                // Reset options when changing away from types that use them
                options: ["select", "checkbox", "radio"].includes(value)
                  ? editedField.options
                  : undefined,
              })
            }
          >
            <SelectTrigger id="field-type">
              <SelectValue placeholder="Select field type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="textarea">Text Area</SelectItem>
              <SelectItem value="select">Dropdown</SelectItem>
              <SelectItem value="checkbox">Checkbox Group</SelectItem>
              <SelectItem value="radio">Radio Group</SelectItem>
              <SelectItem value="date">Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="field-placeholder">Placeholder Text (Optional)</Label>
        <Input
          id="field-placeholder"
          value={editedField.placeholder || ""}
          onChange={(e) =>
            setEditedField({ ...editedField, placeholder: e.target.value })
          }
          placeholder="Enter placeholder text"
        />
      </div>

      <div>
        <Label htmlFor="field-description">Field Description (Optional)</Label>
        <Input
          id="field-description"
          value={editedField.description || ""}
          onChange={(e) =>
            setEditedField({ ...editedField, description: e.target.value })
          }
          placeholder="Enter field description"
        />
      </div>

      {/* Options for select, checkbox, radio */}
      {["select", "checkbox", "radio"].includes(editedField.type) && (
        <div>
          <Label>Options</Label>
          <div className="space-y-2 mt-2">
            {(editedField.options || []).map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input value={typeof option === 'string' ? option : option.label || option.value} readOnly />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleOptionRemove(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <div className="flex items-center gap-2">
              <Input
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                placeholder="Add new option"
              />
              <Button size="sm" onClick={handleOptionAdd}>
                Add
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Checkbox
          id="field-required"
          checked={editedField.required}
          onCheckedChange={(checked) =>
            setEditedField({
              ...editedField,
              required: checked === true,
            })
          }
        />
        <label
          htmlFor="field-required"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Required field
        </label>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onUpdate(editedField)}>Save Field</Button>
      </div>
    </div>
  );
};

// Default form fields that come with every registration
const DEFAULT_FIELDS: FormField[] = [
  {
    id: "fullName",
    type: "text",
    label: "Full Name",
    placeholder: "Enter your full name",
    required: true,
    description: "Your complete name as it appears on your ID",
  },
  {
    id: "email",
    type: "email",
    label: "Email Address",
    placeholder: "Enter your email address",
    required: true,
  },
  {
    id: "phone",
    type: "phone",
    label: "Phone Number",
    placeholder: "Enter your phone number",
    required: false,
  },
];

export default function StudentRegistration({
  workshop,
  onChange,
  onNext,
  onPrevious,
  onContinue,
  isEditing,
}: StudentRegistrationProps) {
  // Initialize custom fields from workshop or use empty array
  const [customFields, setCustomFields] = useState<FormField[]>(
    (workshop.customRegistrationFields as FormField[]) || []
  );

  // Sync customFields state with workshop prop changes (important for editing mode)
  useEffect(() => {
    if (workshop.customRegistrationFields) {
      setCustomFields(workshop.customRegistrationFields as FormField[]);
    }
  }, [workshop.customRegistrationFields]);

  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [addingField, setAddingField] = useState(false);
  const [defaultFieldsEnabled, setDefaultFieldsEnabled] = useState(
    workshop.useDefaultRegistrationFields !== false
  );

  // Sync defaultFieldsEnabled with workshop prop changes
  useEffect(() => {
    setDefaultFieldsEnabled(workshop.useDefaultRegistrationFields !== false);
  }, [workshop.useDefaultRegistrationFields]);

  // For drag and drop functionality
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle field dragging
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setCustomFields((fields) => {
        const oldIndex = fields.findIndex((f) => f.id === active.id);
        const newIndex = fields.findIndex((f) => f.id === over.id);

        const reorderedFields = arrayMove(fields, oldIndex, newIndex);

        // Update workshop state
        onChange("customRegistrationFields", reorderedFields);

        return reorderedFields;
      });
    }
  };

  // Add a new field
  const handleAddField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type: "text",
      label: "New Field",
      placeholder: "",
      required: false,
    };

    setEditingField(newField);
    setAddingField(true);
  };

  // Save field (new or edited)
  const handleSaveField = (field: FormField) => {
    let updatedFields: FormField[];

    if (addingField) {
      updatedFields = [...customFields, field];
      setCustomFields(updatedFields);
      setAddingField(false);
    } else {
      updatedFields = customFields.map((f) => (f.id === field.id ? field : f));
      setCustomFields(updatedFields);
    }

    setEditingField(null);

    // Update the workshop with the new fields
    onChange("customRegistrationFields", updatedFields);
  };

  // Delete a field
  const handleDeleteField = (id: string) => {
    const updatedFields = customFields.filter((f) => f.id !== id);
    setCustomFields(updatedFields);
    onChange("customRegistrationFields", updatedFields);
  };

  // Toggle default fields
  const handleToggleDefaultFields = (enabled: boolean) => {
    setDefaultFieldsEnabled(enabled);
    onChange("useDefaultRegistrationFields", enabled);
  };

  // Save all changes and continue
  const handleSaveAndContinue = () => {
    // Validate that fields have proper labels
    const invalidFields = customFields.filter((f) => !f.label.trim());

    if (invalidFields.length > 0) {
      toast.error("All fields must have a label");
      return;
    }

    // Validate that dropdown/checkbox/radio fields have options
    const fieldsNeedingOptions = customFields.filter(
      (f) =>
        ["select", "checkbox", "radio"].includes(f.type) &&
        (!f.options || f.options.length < 1)
    );

    if (fieldsNeedingOptions.length > 0) {
      toast.error(
        "Dropdown, checkbox, and radio fields must have at least one option"
      );
      return;
    }

    // Show success message if in edit mode
    if (isEditing) {
      toast.success("Registration form fields updated");
    }

    // Continue to next step
    if (onContinue) onContinue();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registration Form</CardTitle>
        <CardDescription>
          Customize the registration form for students attending your workshop.
          Students will fill this form when registering.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Default fields section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Standard Information</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Include default fields
              </span>
              <Switch
                checked={defaultFieldsEnabled}
                onCheckedChange={handleToggleDefaultFields}
              />
            </div>
          </div>

          {defaultFieldsEnabled && (
            <Accordion type="single" collapsible defaultValue="default-fields">
              <AccordionItem value="default-fields">
                <AccordionTrigger className="text-sm">
                  Standard registration fields
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pl-4 border-l-2 border-gray-100 dark:border-gray-800">
                    {DEFAULT_FIELDS.map((field) => (
                      <div
                        key={field.id}
                        className="p-2 bg-gray-50 dark:bg-gray-900 rounded-md"
                      >
                        <div className="flex items-center">
                          <span className="font-medium">{field.label}</span>
                          {field.required && (
                            <span className="ml-1 text-red-500">*</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {field.description || `Standard ${field.type} field`}
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>

        {/* Custom fields section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Custom Information</h3>
            <Button
              onClick={handleAddField}
              size="sm"
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Field
            </Button>
          </div>

          {/* Field editor for new/editing field */}
          {editingField && (
            <FieldEditor
              field={editingField}
              onUpdate={handleSaveField}
              onCancel={() => {
                setEditingField(null);
                setAddingField(false);
              }}
            />
          )}

          {/* Existing fields list with drag-drop */}
          {customFields.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={customFields.map((field) => field.id)}
                strategy={verticalListSortingStrategy}
              >
                {customFields.map((field) => (
                  <SortableFieldItem
                    key={field.id}
                    field={field}
                    onEdit={(f) => setEditingField(f)}
                    onDelete={handleDeleteField}
                  />
                ))}
              </SortableContext>
            </DndContext>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-md text-center">
              <p className="text-muted-foreground mb-2">
                No custom fields added yet
              </p>
              <Button onClick={handleAddField} size="sm" variant="outline">
                Add Your First Field
              </Button>
            </div>
          )}
        </div>

        {/* Preview section */}
        <div className="mt-6">
          <Accordion type="single" collapsible>
            <AccordionItem value="form-preview">
              <AccordionTrigger>Form Preview</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 p-4 border rounded-lg bg-white dark:bg-gray-950">
                  <h3 className="text-lg font-semibold">
                    Registration Form Preview
                  </h3>

                  {defaultFieldsEnabled &&
                    DEFAULT_FIELDS.map((field) => (
                      <div key={field.id} className="space-y-2">
                        <div className="flex items-center">
                          <Label>{field.label}</Label>
                          {field.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </div>
                        {field.description && (
                          <p className="text-xs text-muted-foreground">
                            {field.description}
                          </p>
                        )}
                        {field.type === "textarea" ? (
                          <Textarea placeholder={field.placeholder} disabled />
                        ) : (
                          <Input placeholder={field.placeholder} disabled />
                        )}
                      </div>
                    ))}

                  {customFields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <div className="flex items-center">
                        <Label>{field.label}</Label>
                        {field.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </div>
                      {field.description && (
                        <p className="text-xs text-muted-foreground">
                          {field.description}
                        </p>
                      )}

                      {field.type === "textarea" && (
                        <Textarea placeholder={field.placeholder} disabled />
                      )}

                      {(field.type === "text" ||
                        field.type === "email" ||
                        field.type === "phone" ||
                        field.type === "number" ||
                        field.type === "date") && (
                        <Input
                          type={field.type}
                          placeholder={field.placeholder}
                          disabled
                        />
                      )}

                      {field.type === "select" && field.options && (
                        <Select disabled>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                field.placeholder || "Select an option"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options.map((option, i) => {
                              const optionValue =
                                typeof option === "string"
                                  ? option
                                  : option.value;
                              const optionLabel =
                                typeof option === "string"
                                  ? option
                                  : option.label;

                              return (
                                <SelectItem key={i} value={optionValue}>
                                  {optionLabel}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      )}

                      {field.type === "checkbox" && field.options && (
                        <div className="space-y-2">
                          {field.options.map((option, i) => {
                            const optionValue =
                              typeof option === "string"
                                ? option
                                : option.value;
                            const optionLabel =
                              typeof option === "string"
                                ? option
                                : option.label;

                            return (
                              <div
                                key={i}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox id={`${field.id}-${i}`} disabled />
                                <label
                                  htmlFor={`${field.id}-${i}`}
                                  className="text-sm"
                                >
                                  {optionLabel}
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {field.type === "radio" && field.options && (
                        <div className="space-y-2">
                          {field.options.map((option, i) => {
                            const optionValue =
                              typeof option === "string"
                                ? option
                                : option.value;
                            const optionLabel =
                              typeof option === "string"
                                ? option
                                : option.label;

                            return (
                              <div
                                key={i}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="radio"
                                  id={`${field.id}-${i}`}
                                  name={field.id}
                                  disabled
                                  className="h-4 w-4"
                                />
                                <label
                                  htmlFor={`${field.id}-${i}`}
                                  className="text-sm"
                                >
                                  {optionLabel}
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Field type guide */}
        <div className="mt-4">
          <Accordion type="single" collapsible>
            <AccordionItem value="field-types">
              <AccordionTrigger>Field Type Guide</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-1">Text</h4>
                    <p className="text-muted-foreground">
                      Simple text input for names, addresses, etc.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Email</h4>
                    <p className="text-muted-foreground">
                      Email address with validation.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Phone</h4>
                    <p className="text-muted-foreground">Phone number field.</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Number</h4>
                    <p className="text-muted-foreground">
                      Numeric input for ages, quantities, etc.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Text Area</h4>
                    <p className="text-muted-foreground">
                      Multi-line text for longer responses.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Dropdown</h4>
                    <p className="text-muted-foreground">
                      Select from predefined options.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Checkbox Group</h4>
                    <p className="text-muted-foreground">
                      Select multiple options from a list.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Radio Group</h4>
                    <p className="text-muted-foreground">
                      Select a single option from a list.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Date</h4>
                    <p className="text-muted-foreground">Date picker field.</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>

      <div className="flex justify-between border-t p-4">
        {onPrevious && (
          <Button variant="outline" onClick={onPrevious}>
            Previous
          </Button>
        )}
        <div className="flex gap-2">
          {onContinue && (
            <Button onClick={handleSaveAndContinue}>
              {isEditing ? "Save & Continue" : "Continue"}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
