'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

const initialState = {
  report: null,
  error: null,
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending} className="w-full sm:w-auto">{pending ? 'Generating...' : 'Generate Report'}</Button>;
}

export default function ReportGenerator({ formAction }: { formAction: (prevState: any, formData: FormData) => Promise<any> }) {
  const [state, action] = useFormState(formAction, initialState);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <Card className="lg:col-span-1 h-fit">
        <form action={action}>
          <CardHeader>
            <CardTitle className="font-headline">New Report</CardTitle>
            <CardDescription>Fill in the details to generate a custom report.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="reportType">Report Type</Label>
                <Select name="reportType" defaultValue="attendance">
                    <SelectTrigger id="reportType">
                        <SelectValue placeholder="Select a report type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="attendance">Attendance</SelectItem>
                        <SelectItem value="absences">Absences & PTO</SelectItem>
                        <SelectItem value="project costs">Project Costs</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateRange">Date Range</Label>
              <Input id="dateRange" name="dateRange" placeholder="e.g., Last Month, Q3 2024" defaultValue="Last 30 days" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeRange">Time Range</Label>
              <Input id="timeRange" name="timeRange" placeholder="e.g., 9am-5pm" defaultValue="All day"/>
            </div>
             <div className="space-y-2">
              <Label htmlFor="informationDetails">Specific Information</Label>
              <Textarea id="informationDetails" name="informationDetails" placeholder="e.g., Include overtime hours, filter by Engineering department" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="format">Format</Label>
                <Select name="format" defaultValue="pdf">
                    <SelectTrigger id="format">
                        <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="PDF">PDF</SelectItem>
                        <SelectItem value="Excel">Excel</SelectItem>
                        <SelectItem value="CSV">CSV</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
      
      <div className="lg:col-span-2">
        {state.success && state.report && (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Generated Report</CardTitle>
                    <CardDescription>Here is the report generated based on your criteria.</CardDescription>
                </CardHeader>
                <CardContent>
                    <pre className="bg-muted p-4 rounded-md whitespace-pre-wrap font-code text-sm">{state.report}</pre>
                </CardContent>
            </Card>
        )}
        {state.error && (
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
            </Alert>
        )}
        {!state.report && !state.error && (
            <div className="flex items-center justify-center h-full rounded-lg border-2 border-dashed border-muted-foreground/30">
                <div className="text-center p-8">
                    <h3 className="text-lg font-semibold text-muted-foreground">Your report will appear here</h3>
                    <p className="text-sm text-muted-foreground/80 mt-2">Fill out the form and click "Generate Report" to get started.</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
