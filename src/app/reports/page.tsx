import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { generateEmployeeReport, GenerateEmployeeReportInput } from '@/ai/flows/generate-employee-report';
import ReportGenerator from './_components/report-generator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const latestReports = [
  { id: "REP-001", type: "Asistencia", dateRange: "Último Mes", format: "PDF", status: "Completado" },
  { id: "REP-002", type: "Costos de Proyecto", dateRange: "T3 2024", format: "Excel", status: "Completado" },
  { id: "REP-003", type: "Ausencias", dateRange: "Últimos 30 Días", format: "CSV", status: "Completado" },
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
            const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
            return { success: false, report: null, error: `No se pudo generar el informe: ${errorMessage}` };
        }
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-headline font-bold tracking-tight">Herramienta de Informes</h1>
                <p className="text-muted-foreground">Genera informes personalizables sobre procesos clave de gestión de empleados.</p>
            </div>
            
            <ReportGenerator formAction={generateReportAction} />

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Últimos Informes</CardTitle>
                    <CardDescription>Un historial de informes exportados recientemente para una descarga fácil.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID de Informe</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Rango de Fechas</TableHead>
                                <TableHead>Formato</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead><span className="sr-only">Acciones</span></TableHead>
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
                                    <TableCell><Badge className="bg-accent/10 text-accent">{report.status}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm">
                                            <Download className="mr-2 h-4 w-4" />
                                            Descargar
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
