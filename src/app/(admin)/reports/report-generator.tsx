'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { generateAbsenceReport } from '@/ai/flows/generate-absence-report';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Inputs = {
  query: string;
};

export function ReportGenerator() {
  const { register, handleSubmit, reset } = useForm<Inputs>();
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const { toast } = useToast();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsLoading(true);
    setReport(null);
    try {
      const result = await generateAbsenceReport({ query: data.query });
      setReport(result.report);
      reset();
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Report Generation Failed',
        description: 'An error occurred while generating the report. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Generate a Report</CardTitle>
            <CardDescription>
              Describe the report you need. For example, "absences from the sales team in Q2" or "employee turnover rate this year".
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="query">Your Request</Label>
              <Textarea
                id="query"
                placeholder="e.g., Show me all approved sick leaves in the last month."
                {...register('query', { required: true })}
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Generate Report
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Generated Report</CardTitle>
          <CardDescription>The AI-generated report will appear here.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          {report && (
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap rounded-md bg-muted p-4">
              {report}
            </div>
          )}
          {!isLoading && !report && (
            <div className="flex items-center justify-center h-full text-center text-muted-foreground">
              <p>Your report is pending generation.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
