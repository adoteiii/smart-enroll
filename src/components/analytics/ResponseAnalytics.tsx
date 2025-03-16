import { FormField, Registration, WorkshopComponentProps } from "@/lib/componentprops";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f97316", "#10b981", "#6366f1"];

interface ResponseAnalyticsProps {
  registrations: Registration[];
  workshop: WorkshopComponentProps | undefined;
}

export default function ResponseAnalytics({
  registrations,
  workshop,
}: ResponseAnalyticsProps) {
  if (!workshop || !workshop.customRegistrationFields || !registrations.length) {
    return (
      <div className="rounded-md bg-muted/50 p-8 text-center">
        <p className="text-muted-foreground">No form data available for analysis</p>
      </div>
    );
  }

  // Only analyze fields that have responses
  const fieldsWithData = workshop.customRegistrationFields.filter(field => {
    return registrations.some(reg => 
      reg.formData && (reg.formData as Record<string, any>)[field.id as string] !== undefined
    );
  });

  if (!fieldsWithData.length) {
    return (
      <div className="rounded-md bg-muted/50 p-8 text-center">
        <p className="text-muted-foreground">No form responses found for this workshop</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{workshop.title}</h2>
          <p className="text-muted-foreground">{registrations.length} registrations analyzed</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {fieldsWithData.map((field) => (
          <FieldAnalysis 
            key={field.id} 
            field={field} 
            registrations={registrations} 
          />
        ))}
      </div>
    </div>
  );
}

function FieldAnalysis({ field, registrations }: { field: FormField, registrations: Registration[] }) {
  // Get all responses for this field
  const responses = registrations
    .map(reg => reg.formData && (reg.formData as Record<string, any>)[field.id as string])
    .filter(response => response !== undefined);
  
  if (!responses.length) return null;

  // For select, radio, and checkbox fields, we can show charts
  if (['select', 'radio', 'checkbox'].includes(field.type)) {
    // Count occurrences of each option
    const counts = new Map<string, number>();
    
    // Handle both single values and arrays
    responses.forEach(response => {
      if (Array.isArray(response)) {
        // For multi-select/checkbox
        response.forEach(item => {
          counts.set(item, (counts.get(item) || 0) + 1);
        });
      } else if (response) {
        // For single select/radio
        counts.set(response.toString(), (counts.get(response.toString()) || 0) + 1);
      }
    });
    
    // Convert to chart data
    const chartData = Array.from(counts.entries()).map(([name, value]) => ({
      name,
      value
    }));

    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">{field.label}</CardTitle>
          <CardDescription>{field.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {counts.size <= 5 ? (
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} responses`, ""]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fontSize: 12 }}
                    width={120}
                  />
                  <Tooltip formatter={(value) => [`${value} responses`, ""]} />
                  <Bar dataKey="value" fill="var(--primary)" barSize={15} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="mt-4 text-sm">
            <p><span className="font-medium">Most common:</span> {
              Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0]
            }</p>
            <p><span className="font-medium">Response rate:</span> {
              Math.round((responses.filter(r => r !== null && r !== '').length / registrations.length) * 100)
            }%</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // For text fields, we can show text analysis
  if (field.type === 'text' || field.type === 'textarea') {
    const nonEmptyResponses = responses.filter(r => r && String(r).trim() !== '');
    const avgLength = nonEmptyResponses.length > 0 
      ? Math.round(nonEmptyResponses.reduce((sum, r) => sum + String(r).length, 0) / nonEmptyResponses.length) 
      : 0;
    
    // Count word frequencies for simple word cloud data
    const wordFrequency: Record<string, number> = {};
    nonEmptyResponses.forEach(response => {
      String(response)
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 3) // Only count words with at least 4 chars
        .forEach(word => {
          wordFrequency[word] = (wordFrequency[word] || 0) + 1;
        });
    });
    
    // Get top words
    const topWords = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
    
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">{field.label}</CardTitle>
          <CardDescription>{field.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col justify-center items-center p-4 bg-muted/30 rounded-md">
                <span className="text-3xl font-bold">{nonEmptyResponses.length}</span>
                <span className="text-sm text-muted-foreground">Responses</span>
              </div>
              <div className="flex flex-col justify-center items-center p-4 bg-muted/30 rounded-md">
                <span className="text-3xl font-bold">{avgLength}</span>
                <span className="text-sm text-muted-foreground">Avg. Length</span>
              </div>
            </div>
            
            {topWords.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Common Words</h4>
                <div className="flex flex-wrap gap-2">
                  {topWords.map(([word, count]) => (
                    <Badge key={word} variant="secondary" className="text-xs">
                      {word} ({count})
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <h4 className="text-sm font-medium mb-2">Sample Responses</h4>
              <div className="max-h-32 overflow-y-auto space-y-2">
                {nonEmptyResponses.slice(0, 3).map((response, i) => (
                  <div key={i} className="p-2 text-sm bg-muted/30 rounded-sm">
                    "{String(response)}"
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // For other field types
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{field.label}</CardTitle>
        <CardDescription>{field.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {responses.filter(r => r !== undefined && r !== null && r !== '').length} 
          {' '}of{' '}
          {registrations.length} provided responses
        </p>
      </CardContent>
    </Card>
  );
}