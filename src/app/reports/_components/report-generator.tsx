
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Loader2 } from 'lucide-react';

const initialState = {
  report: null,
  error: null,
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending} className="w-full sm:w-auto">{pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generando...</> : 'Generar Informe'}</Button>;
}

export default function ReportGenerator({ formAction }: { formAction: (prevState: any, formData: FormData) => Promise<any> }) {
  const [state, action] = useFormState(formAction, initialState);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <Card className="lg:col-span-1 h-fit bg-gradient-accent-to-card">
        <form action={action}>
          <CardHeader>
            <CardTitle>Nuevo Informe</CardTitle>
            <CardDescription>Completa los detalles para generar un informe personalizado.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="reportType">Tipo de Informe</Label>
                <Select name="reportType" defaultValue="Asistencia">
                    <SelectTrigger id="reportType">
                        <SelectValue placeholder="Selecciona un tipo de informe" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Asistencia">Asistencia</SelectItem>
                        <SelectItem value="Ausencias y Tiempo Libre">Ausencias y Tiempo Libre</SelectItem>
                        <SelectItem value="Costos de Proyecto">Costos de Proyecto</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateRange">Rango de Fechas</Label>
              <Input id="dateRange" name="dateRange" placeholder="Ej., Último Mes, T3 2024" defaultValue="Últimos 30 días" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeRange">Rango Horario</Label>
              <Input id="timeRange" name="timeRange" placeholder="Ej., 9am-5pm" defaultValue="Todo el día"/>
            </div>
             <div className="space-y-2">
              <Label htmlFor="informationDetails">Información Específica</Label>
              <Textarea id="informationDetails" name="informationDetails" placeholder="Ej., Incluir horas extra, filtrar por el departamento de Ingeniería" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="format">Formato</Label>
                <Select name="format" defaultValue="PDF">
                    <SelectTrigger id="format">
                        <SelectValue placeholder="Seleccionar formato" />
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
            <Card className="bg-gradient-accent-to-card">
                <CardHeader>
                    <CardTitle>Informe Generado</CardTitle>
                    <CardDescription>Aquí está el informe generado según tus criterios.</CardDescription>
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
            <div className="flex items-center justify-center h-full rounded-2xl border-2 border-dashed border-muted-foreground/30">
                <div className="text-center p-8">
                    <h3 className="text-lg font-semibold text-muted-foreground">Tu informe aparecerá aquí</h3>
                    <p className="text-sm text-muted-foreground/80 mt-2">Completa el formulario y haz clic en "Generar Informe" para empezar.</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
