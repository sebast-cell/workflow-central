'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Download, Bot, Loader2 } from 'lucide-react';
import { summarizeAttendance } from '@/ai/flows/summarize-attendance-flow';

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
  
  const resetState = () => {
    setReport(null);
    setError(null);
    setIsGenerating(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      resetState();
    }
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setError(null);
    setReport(null);

    if (attendanceLog.length === 0) {
        setError("No se encontraron datos para analizar con los filtros actuales.");
        setIsGenerating(false);
        return;
    }

    try {
      // The attendanceLog prop contains more fields, but the flow only needs these ones.
      // We map it to ensure we only send what's necessary.
      const attendanceDataForAI = attendanceLog.map(log => ({
        time: log.time,
        employee: log.employee,
        status: log.status,
        location: log.location,
      }));
      const result = await summarizeAttendance(attendanceDataForAI);
      setReport(result.summary);
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error desconocido.';
        setError(`No se pudo generar el informe de IA: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!report) return;
    
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `informe_asistencia_ia.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Bot className="mr-2 h-4 w-4" />
          Resumen con IA
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Generar Resumen de Asistencia con IA</DialogTitle>
          <DialogDescription>
            La IA analizará los datos filtrados para generar un resumen con métricas clave y patrones.
          </DialogDescription>
        </DialogHeader>
        
        {report ? (
          <div className="space-y-4 pt-4">
            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>¡Resumen generado!</AlertTitle>
              <AlertDescription>
                Tu informe de IA está listo para descargar o copiar.
              </AlertDescription>
            </Alert>
            <div className="max-h-[40vh] overflow-y-auto rounded-md border bg-muted p-4">
                <pre className="whitespace-pre-wrap font-sans text-sm">{report}</pre>
            </div>
            <DialogFooter className="pt-4 sm:justify-start">
              <Button onClick={handleDownload} className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Descargar como .txt
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4 pt-4">
            <div className="text-center p-8 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">
                    Se analizarán <strong>{attendanceLog.length}</strong> registros de asistencia.
                </p>
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
              <Button onClick={handleGenerateReport} disabled={isGenerating || attendanceLog.length === 0}>
                {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isGenerating ? 'Analizando...' : 'Generar Resumen'}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
