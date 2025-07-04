import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { generateEmployeeReport, GenerateEmployeeReportInput } from '@/ai/flows/generate-employee-report';
import ReportGenerator from './_components/report-generator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const latestReports = [
  { id: "REP-001", type: "Attendance", dateRange: "Last Month", format: "PDF", status: "Completed" },
  { id: "REP-002", type: "Project Costs", dateRange: "Q3 2024", format: "Excel", status: "Completed" },
  { id: "REP-003", type: "Absences", dateRange: "Last 30 Days", format: "CSV", status: "Completed" },
];

export default function ReportsPage() {
    async function generateReportAction(
        prevState: any,
        formData: FormData
    ) {
        'use server';

        const data: GenerateEmployeeReportInput = {
            reportType: formData.get('reportType') as string,
            informationDetails: formData.get('informationDetails') as string,
            dateRange: formData.get('dateRange') as string,
            timeRange: formData.get('timeRange') as string,
            format: formData.get('format') as string,
        };
        
        try {
            const result = await generateEmployeeReport(data);
            return { success: true, report: result.report, error: null };
        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            return { success: false, report: null, error: `Failed to generate report: ${errorMessage}` };
        }
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-headline font-bold tracking-tight">Reporting Tool</h1>
                <p className="text-muted-foreground">Generate customizable reports on key employee management processes.</p>
            </div>
            
            <ReportGenerator formAction={generateReportAction} />

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Latest Reports</CardTitle>
                    <CardDescription>A history of recently exported reports for easy download.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Report ID</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Date Range</TableHead>
                                <TableHead>Format</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {latestReports.map(report => (
                                <TableRow key={report.id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground"/>
                                        {report.id}
                                    </TableCell>
                                    <TableCell>{report.type}</TableCell>
                                    <TableCell>{report.dateRange}</TableCell>
                                    <TableCell>{report.format}</TableCell>
                                    <TableCell><Badge variant="secondary" className="bg-green-100 text-green-800">{report.status}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm">
                                            <Download className="mr-2 h-4 w-4" />
                                            Download
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
