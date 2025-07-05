'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Download, FileSpreadsheet, Loader2 } from 'lucide-react';

type AttendanceLog = {
  time: string;
  employee: string;
  status: string;
  location: string;
};

export function AttendanceReportDialog({ attendanceLog }: { attendanceLog: AttendanceLog[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Form state
  const [dateRange, setDateRange] = useState('Hoy');
  const [locationFilter, setLocationFilter] = useState('');
  const [format, setFormat] = useState('PDF');

  const resetState = () => {
    setReport(null);
    setError(null);
    setIsGenerating(false);
    setDateRange('Hoy');
    setLocationFilter('');
    setFormat('PDF');
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      resetState();
    }
  };

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setError(null);
    setReport(null);

    // Simulate processing time
    setTimeout(() => {
      try {
        // NOTE: Date range filtering is simplified for this internal version.
        // It currently uses all provided data.
        let filteredData = [...attendanceLog];

        if (locationFilter) {
          filteredData = filteredData.filter(log =>
            log.location.toLowerCase().includes(locationFilter.toLowerCase())
          );
        }

        if (filteredData.length === 0) {
          setError("No se encontraron datos con los filtros aplicados.");
          setIsGenerating(false);
          return;
        }

        let generatedReport: string;
        if (format === 'Excel') {
          const headers = ["Hora", "Empleado", "Estado", "Ubicación"];
          const csvRows = [
            headers.join(','),
            ...filteredData.map(row =>
              [row.time, row.employee, row.status, row.location]
              .map(value => `"${String(value).replace(/"/g, '""')}"`)
              .join(',')
            )
          ];
          generatedReport = csvRows.join('\n');
        } else { // PDF (Plain Text)
          const reportLines = [
            `Informe de Asistencia - ${dateRange}`,
            `Filtro de ubicación: ${locationFilter || 'Todos'}`,
            "===========================================================",
            ...filteredData.map(row =>
              `${row.time.padEnd(10)} | ${row.employee.padEnd(20)} | ${row.status.padEnd(15)} | ${row.location}`
            )
          ];
          generatedReport = reportLines.join('\n');
        }
        setReport(generatedReport);
      } catch (e) {
          const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error desconocido.';
          setError(`No se pudo generar el informe: ${errorMessage}`);
      } finally {
        setIsGenerating(false);
      }
    }, 500); // Simulate network/processing delay
  };

  const handleDownload = () => {
    if (!report) return;

    const extension = format.toLowerCase();
    const isExcel = extension === 'excel';
    const downloadExtension = isExcel ? 'csv' : 'txt';
    const mimeType = isExcel ? 'text/csv;charset=utf-8' : 'text/plain;charset=utf-8';
    
    const blob = new Blob([report], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `informe_asistencia.${downloadExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Exportar Datos
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Generar Informe de Asistencia</DialogTitle>
          <DialogDescription>
            Configura las opciones para exportar los datos de asistencia.
          </DialogDescription>
        </DialogHeader>
        
        {report ? (
          <div className="space-y-4 pt-4">
            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>¡Informe generado!</AlertTitle>
              <AlertDescription>
                Tu informe de texto está listo para descargar.
              </AlertDescription>
            </Alert>
            <DialogFooter className="pt-4">
              <Button onClick={handleDownload} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Descargar como {format === 'Excel' ? '.csv' : '.txt'}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="dateRange">Rango de Fechas</Label>
              <Input id="dateRange" name="dateRange" placeholder="Ej., Últimos 7 días, Hoy" value={dateRange} onChange={e => setDateRange(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="locationFilter">Filtrar por Ubicación (opcional)</Label>
              <Input id="locationFilter" name="locationFilter" placeholder="Ej., Oficina" value={locationFilter} onChange={e => setLocationFilter(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="format">Formato de Salida</Label>
              <Select name="format" value={format} onValueChange={setFormat}>
                  <SelectTrigger id="format">
                      <SelectValue placeholder="Seleccionar formato" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="PDF">PDF (texto)</SelectItem>
                      <SelectItem value="Excel">Excel (CSV)</SelectItem>
                  </SelectContent>
              </Select>
            </div>
            
            {error && (
              <Alert variant="destructive">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Error al generar</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancelar</Button>
              <Button onClick={handleGenerateReport} disabled={isGenerating}>
                {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isGenerating ? 'Generando...' : 'Generar Informe'}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
