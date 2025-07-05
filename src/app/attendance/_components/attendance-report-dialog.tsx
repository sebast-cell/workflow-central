'use client';

import { useActionState, useState, useEffect, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Download, FileSpreadsheet } from 'lucide-react';
import { generateAttendanceReportAction } from '../actions';

const initialState = {
  report: null,
  error: null,
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? 'Generando...' : 'Generar Informe'}</Button>;
}

export function AttendanceReportDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, action] = useActionState(generateAttendanceReportAction, initialState);
  const [formKey, setFormKey] = useState(Date.now());
  const [format, setFormat] = useState('PDF');
  const [, startTransition] = useTransition();

  useEffect(() => {
    // When the dialog is opened, reset the form and the action state
    if (isOpen) {
      setFormKey(Date.now());
      // Calling action with empty form data to reset state, wrapped in a transition
      startTransition(() => {
        action(new FormData());
      });
    }
  }, [isOpen, action]);

  const handleDownload = () => {
    if (!state.report) return;

    const extension = format.toLowerCase();
    const isExcel = extension === 'excel';
    const downloadExtension = isExcel ? 'csv' : 'txt';
    const mimeType = isExcel ? 'text/csv;charset=utf-8' : 'text/plain;charset=utf-8';
    
    const blob = new Blob([state.report], { type: mimeType });
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
            Configura las opciones para exportar los datos de asistencia. La IA generará el contenido.
          </DialogDescription>
        </DialogHeader>
        
        {state.success && state.report ? (
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
          <form key={formKey} action={action} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="dateRange">Rango de Fechas</Label>
              <Input id="dateRange" name="dateRange" placeholder="Ej., Últimos 7 días, Hoy" defaultValue="Hoy" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="informationDetails">Detalles Adicionales</Label>
              <Textarea id="informationDetails" name="informationDetails" placeholder="Ej., Incluir solo entradas, filtrar por ubicación 'Oficina'..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="format">Formato de Salida</Label>
              <Select name="format" defaultValue="PDF" onValueChange={setFormat}>
                  <SelectTrigger id="format">
                      <SelectValue placeholder="Seleccionar formato" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="PDF">PDF (texto)</SelectItem>
                      <SelectItem value="Excel">Excel (CSV)</SelectItem>
                  </SelectContent>
              </Select>
            </div>
            
            {state.error && (
              <Alert variant="destructive">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Error al generar</AlertTitle>
                  <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancelar</Button>
              <SubmitButton />
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
