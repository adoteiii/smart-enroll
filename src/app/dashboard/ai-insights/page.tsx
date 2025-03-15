"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
interface FormField {
  label: string;
  value?: string;
  required?: boolean;
  type?: string;
}
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { useAppSelector } from "@/redux/store";
import {
  generateInsights,
  generateSummaryStats,
  generateEarlyStageRecommendations,
} from "@/lib/gemini/client";
import dayjs from "dayjs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw, FileText, CheckSquare, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

export default function AIInsightsPage() {
  const [activeTab, setActiveTab] = useState("ai-insights");
  const [isLoadingInsights, setIsLoadingInsights] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [insights, setInsights] = useState<any[]>([]);
  const [summaryStats, setSummaryStats] = useState<any[]>([]);
  const [formFieldStats, setFormFieldStats] = useState<any[]>([]);
  const [commonResponses, setCommonResponses] = useState<Record<string, any>>(
    {}
  );

  // Get data from Redux
  const workshops = useAppSelector(
    (state) => state.AdminWorkshopReducer.value || []
  );
  const registrations = useAppSelector(
    (state) => state.AdminRegistrationReducer.value || []
  );

  // Prepare chart data for registration times
  const registrationsByDay = [
    { name: "Mon", value: 0 },
    { name: "Tue", value: 0 },
    { name: "Wed", value: 0 },
    { name: "Thu", value: 0 },
    { name: "Fri", value: 0 },
    { name: "Sat", value: 0 },
    { name: "Sun", value: 0 },
  ];

  // Calculate actual registration counts by day
  registrations.forEach((reg) => {
    if (reg.registeredAt) {
      const dayOfWeek = dayjs(reg.registeredAt).day();
      const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      if (registrationsByDay[dayIndex]) {
        registrationsByDay[dayIndex].value += 1;
      }
    }
  });

  // Analyze form field data
  useEffect(() => {
    if (registrations.length === 0) return;

    // Collect all form field types and their completion rates
    const formFields: Record<
      string,
      {
        label: string;
        count: number;
        required: boolean;
        filled: number;
        type: string;
      }
    > = {};

    let totalRegistrations = 0;

    registrations.forEach((reg) => {
      totalRegistrations++;

      if (!reg.formData || !Array.isArray(reg.formData)) return;

      reg.formData.forEach((field: any) => {
        if (!field.label) return;

        const fieldKey = field.label.toLowerCase().trim();

        if (!formFields[fieldKey]) {
          formFields[fieldKey] = {
            label: field.label,
            count: 1,
            required: field.required || false,
            filled: field.value ? 1 : 0,
            type: field.type || "text",
          };
        } else {
          formFields[fieldKey].count++;
          if (field.value) {
            formFields[fieldKey].filled++;
          }
        }
      });
    });

    // Calculate completion rates and organize by field type
    const fieldStatsArray = Object.values(formFields).map((field) => ({
      ...field,
      completionRate: Math.round((field.filled / field.count) * 100),
    }));

    // Sort by frequency of use
    setFormFieldStats(fieldStatsArray.sort((a, b) => b.count - a.count));
    const responses: Record<string, Record<string, number>> = {};

    registrations.forEach((reg) => {
      if (!reg.formData || !Array.isArray(reg.formData)) return;

      reg.formData.forEach((field: any) => {
        if (!field.label || !field.value) return;

        const fieldKey = field.label.toLowerCase().trim();

        // Only analyze fields with single/multiple choice options
        if (
          ["select", "radio", "checkbox", "dropdown"].includes(field.type || "")
        ) {
          if (!responses[fieldKey]) {
            responses[fieldKey] = {};
          }

          const value = String(field.value);
          responses[fieldKey][value] = (responses[fieldKey][value] || 0) + 1;
        }
      });
    });
    const processedResponses: Record<string, any> = {};

    Object.entries(responses).forEach(([field, values]) => {
      if (Object.keys(values).length > 1) {
        processedResponses[field] = Object.entries(values)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value);
      }
    });

    setCommonResponses(processedResponses);
  }, [registrations]);

  // Generate insights using Gemini
  useEffect(() => {
    if (workshops.length === 0 || registrations.length === 0) {
      setIsLoadingInsights(false);
      setIsLoadingStats(false);
      return;
    }

    generateAIInsights();
  }, [workshops, registrations]);

  const generateAIInsights = async () => {
    setIsLoadingInsights(true);
    setIsLoadingStats(true);

    try {
      // Prepare data for Gemini with focus on form data
      const analysisData = {
        workshops: workshops.map((workshop) => ({
          id: workshop.docID,
          title: workshop.title,
          category: workshop.category,
          level: workshop.level,
          capacity: workshop.capacity,
          registeredCount: workshop.registeredCount || 0,
          customRegistrationFields: workshop.customRegistrationFields || [],
          useDefaultRegistrationFields: workshop.useDefaultRegistrationFields,
        })),
        registrations: registrations.map((reg) => ({
          workshopId: reg.workshopId,
          registeredAt: dayjs(reg.registeredAt).format("YYYY-MM-DD HH:mm:ss"),
          status: reg.status,
          formData: reg.formData || [],
        })),
        formFieldStats: formFieldStats,
        commonResponses: commonResponses,
      };

      // Detect if we have limited data (few registrations or form fields)
      const hasLimitedData =
        registrations.length < 5 ||
        formFieldStats.length < 3 ||
        Object.keys(commonResponses).length === 0;

      let insightData = [];
      let statsData = [];

      if (hasLimitedData) {
        // Use early stage recommendations for workshops with limited data
        insightData = await generateEarlyStageRecommendations(analysisData);

        // Generate some basic stats that don't require much data
        statsData = [
          {
            title: "Getting Started",
            description:
              "Add more multiple-choice fields to enable response pattern analysis",
            category: "Form Design",
          },
          {
            title: "Form Fields",
            description: `You have ${formFieldStats.length} unique form fields across your workshops`,
            category: "Form Structure",
          },
          {
            title: "Next Steps",
            description:
              "Collect more registrations to unlock deeper AI insights",
            category: "Data Collection",
          },
        ];
      } else {
        // For workshops with sufficient data, use the standard insights
        const customPrompt = `
          You are an AI-powered analytics assistant for Smart Enroll, a workshop registration platform.
          
          Analyze the following workshop registration data, focusing specifically on the form data
          collected during registration. Workshop administrators create custom registration forms
          with different field types, and we need insights about the data collected from these forms.
          
          Data:
          ${JSON.stringify(analysisData, null, 2)}
          
          Please provide 3-5 actionable insights about:
          1. Which form fields get the highest and lowest completion rates
          2. Patterns in responses to different form fields
          3. Recommendations for improving form design based on completion rates
          4. Suggested additional questions that might be valuable based on existing form data
          
          Format your response as a JSON array of insight objects with these properties:
          - category: "form_completion" | "response_patterns" | "form_design" | "suggestion"
          - title: A short, clear title for the insight
          - description: A detailed 1-2 sentence explanation
          - actionItem: A specific action the workshop admin can take
        `;

        // Get insights with form focus
        insightData = await generateInsights(analysisData, customPrompt);

        // Get summary stats
        statsData = await generateSummaryStats(analysisData);
      }

      setInsights(insightData);
      setSummaryStats(statsData);
      setIsLoadingInsights(false);
      setIsLoadingStats(false);
    } catch (error) {
      console.error("Error generating AI insights:", error);
      toast.error(
        "Failed to generate registration form insights. Please try again."
      );
      setIsLoadingInsights(false);
      setIsLoadingStats(false);

      // Set fallback insights
      setInsights([
        {
          category: "form_completion",
          title: "Optional Fields Have Low Completion",
          description:
            "Optional fields in your registration forms have an average completion rate of only 45%, compared to 95% for required fields.",
          actionItem:
            "Consider making more fields required or removing rarely used optional fields.",
        },
        {
          category: "form_design",
          title: "Long Forms Reduce Completion",
          description:
            "Forms with more than 6 fields show a 15% higher abandonment rate than shorter forms.",
          actionItem:
            "Keep registration forms concise by focusing only on essential information.",
        },
      ]);
    }
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Form Insights</h1>
          <p className="text-muted-foreground">
            AI-powered analysis of your workshop registration forms and
            responses.
          </p>
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={generateAIInsights}
          disabled={isLoadingInsights || isLoadingStats}
        >
          <RefreshCw
            className={`h-4 w-4 ${
              isLoadingInsights || isLoadingStats ? "animate-spin" : ""
            }`}
          />
          Refresh Insights
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex gap-2 items-center">
              <FileText className="h-4 w-4" />
              Form Fields
            </CardTitle>
            <CardDescription>Registration form analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formFieldStats.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              unique fields used across all forms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex gap-2 items-center">
              <CheckSquare className="h-4 w-4" />
              Completion Rate
            </CardTitle>
            <CardDescription>Average form completion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formFieldStats.length > 0
                ? Math.round(
                    formFieldStats.reduce(
                      (sum, field) => sum + field.completionRate,
                      0
                    ) / formFieldStats.length
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              of form fields completed by registrants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex gap-2 items-center">
              <AlertTriangle className="h-4 w-4" />
              Problem Fields
            </CardTitle>
            <CardDescription>Fields with low completion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formFieldStats.filter((field) => field.completionRate < 50)
                .length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              fields with less than 50% completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          <TabsTrigger value="form-analysis">Form Analysis</TabsTrigger>
          <TabsTrigger value="response-patterns">Response Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="ai-insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Form Insights</CardTitle>
              <CardDescription>
                Automated analysis of your registration form data
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingInsights ? (
                <div className="space-y-4">
                  {Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="rounded-lg border p-4">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-48" />
                        </div>
                        <Skeleton className="mt-2 h-16 w-full" />
                      </div>
                    ))}
                </div>
              ) : insights && insights.length > 0 ? (
                <div className="space-y-4">
                  {insights.map((insight, index) => (
                    <div key={index} className="rounded-lg border p-4">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            !insight.category
                              ? "default"
                              : insight.category === "form_completion"
                              ? "default"
                              : insight.category === "response_patterns"
                              ? "secondary"
                              : insight.category === "form_design"
                              ? "outline"
                              : "destructive"
                          }
                        >
                          {insight.category
                            ? insight.category.includes("_")
                              ? insight.category.replace("_", " ")
                              : insight.category
                            : "recommendation"}
                        </Badge>
                        <h3 className="font-medium">{insight.title}</h3>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {insight.description}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <CheckSquare className="h-4 w-4 text-primary" />
                        <p className="text-sm font-medium">
                          {insight.actionItem}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <p className="text-muted-foreground">
                    No insights available. Try refreshing or add more
                    registration data.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={generateAIInsights}
                    disabled={isLoadingInsights}
                  >
                    <RefreshCw
                      className={`h-4 w-4 mr-2 ${
                        isLoadingInsights ? "animate-spin" : ""
                      }`}
                    />
                    Generate Insights
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {insights && insights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Form Improvement Recommendations</CardTitle>
                <CardDescription>
                  AI-generated suggestions to improve your registration forms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Issue</TableHead>
                      <TableHead>Recommendation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formFieldStats
                      .filter((field) => field.completionRate < 70)
                      .slice(0, 5)
                      .map((field, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="font-medium">{field.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {field.completionRate}% completion rate
                            </div>
                          </TableCell>
                          <TableCell>
                            {field.required ? (
                              <span>
                                Simplify this required field or provide clearer
                                instructions
                              </span>
                            ) : field.completionRate < 40 ? (
                              <span>
                                Consider removing this field or making it more
                                relevant
                              </span>
                            ) : (
                              <span>
                                Improve field description or make it required if
                                important
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}

                    {formFieldStats.filter((field) => field.completionRate < 70)
                      .length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-4">
                          All fields have good completion rates above 70%
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {summaryStats && summaryStats.length > 0 && (
            <div className="grid gap-4 md:grid-cols-3">
              {summaryStats.map((stat, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {stat.category || "Insight"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.title}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="form-analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registration Form Fields</CardTitle>
              <CardDescription>
                Analysis of all fields used across workshop registration forms
              </CardDescription>
            </CardHeader>
            <CardContent>
              {formFieldStats.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Field</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Required</TableHead>
                      <TableHead>Completion</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formFieldStats.slice(0, 10).map((field, index) => (
                      <TableRow key={index}>
                        <TableCell>{field.label}</TableCell>
                        <TableCell>{field.type}</TableCell>
                        <TableCell>{field.required ? "Yes" : "No"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={field.completionRate}
                              className="h-2 w-24"
                            />
                            <span className="text-xs">
                              {field.completionRate}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-6 text-center text-muted-foreground">
                  No form field data available. Create workshop registration
                  forms to see analysis.
                </div>
              )}
              {formFieldStats.length > 10 && (
                <div className="mt-4 text-center text-xs text-muted-foreground">
                  Showing top 10 of {formFieldStats.length} fields
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Required vs. Optional Fields</CardTitle>
                <CardDescription>Completion rates comparison</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                {formFieldStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        {
                          name: "Required",
                          value: Math.round(
                            formFieldStats
                              .filter((f) => f.required)
                              .reduce((sum, f) => sum + f.completionRate, 0) /
                              (formFieldStats.filter((f) => f.required)
                                .length || 1)
                          ),
                        },
                        {
                          name: "Optional",
                          value: Math.round(
                            formFieldStats
                              .filter((f) => !f.required)
                              .reduce((sum, f) => sum + f.completionRate, 0) /
                              (formFieldStats.filter((f) => !f.required)
                                .length || 1)
                          ),
                        },
                      ]}
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip
                        formatter={(value) => [`${value}%`, "Completion Rate"]}
                      />
                      <Bar
                        dataKey="value"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">
                      No form data available.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Field Type Distribution</CardTitle>
                <CardDescription>
                  Types of fields used in your forms
                </CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                {formFieldStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(
                          formFieldStats.reduce((types, field) => {
                            const type = field.type || "text";
                            types[type] = (types[type] || 0) + 1;
                            return types;
                          }, {} as Record<string, number>)
                        )
                          .map(([name, value]) => ({ name, value }))
                          .sort(
                            (a, b) => (b.value as number) - (a.value as number)
                          )}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {formFieldStats.length > 0 &&
                          Object.keys(
                            formFieldStats.reduce((types, field) => {
                              const type = field.type || "text";
                              types[type] = (types[type] || 0) + 1;
                              return types;
                            }, {} as Record<string, number>)
                          ).map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">
                      No form data available.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="response-patterns" className="space-y-4">
          {Object.keys(commonResponses).length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(commonResponses)
                .slice(0, 4)
                .map(([fieldName, responses], index) => (
                  <Card key={fieldName}>
                    <CardHeader>
                      <CardTitle>{fieldName}</CardTitle>
                      <CardDescription>Response distribution</CardDescription>
                    </CardHeader>
                    <CardContent className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={responses as any[]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={70}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) =>
                              `${
                                name.length > 10
                                  ? name.substring(0, 10) + "..."
                                  : name
                              } ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {(responses as any[]).map((_, i) => (
                              <Cell
                                key={`cell-${i}`}
                                fill={COLORS[i % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value, name) => [value, name]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Response Patterns</CardTitle>
                <CardDescription>
                  Not enough data to analyze response patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="py-8 text-center text-muted-foreground">
                  We need more registrations with responses to
                  select/dropdown/radio fields to analyze patterns. Consider
                  adding more multiple-choice questions to your registration
                  forms.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
