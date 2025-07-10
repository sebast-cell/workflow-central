
'use client';

import { useState, useEffect, useRef } from 'react';
import type { DateRange, DayProps } from 'react-day-picker';
import { useDayRender } from 'react-day-picker';
import { addDays, format, isSameDay, parseISO } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, PlusCircle, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { type Holiday, type CalendarData, type AbsenceType, type AbsenceRequest, listSettings, createAbsenceRequest, listAbsenceRequests } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { es } from 'date-fns/locale';

const balances = [
    { type: "Vacaciones", used: 8, total: 20 },
    { type: "Días Personales", used: 2, total: 5 },
    { type: "Licencia por Enfermedad", used: 3, total: 10 },
];

const FAKE_EMPLOYEE = {
    id: "1",
    name: "Olivia Martin"
};

export default function EmployeeAbsencesPage() {
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(),
        to: addDays(new Date(), 4),
    });
    
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [absenceTypes, setAbsenceTypes] = useState<AbsenceType[]>([]);
    const [requests, setRequests] = useState<AbsenceRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [formData, setFormData] = useState<{absenceTypeId: string, reason?: string}>({ absenceTypeId: '' });

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [allCalendars, absenceTypesData, requestsData] = await Promise.all([
                listSettings<CalendarData>('calendars'),
                listSettings<AbsenceType>('absenceTypes'),
                listAbsenceRequests(),
            ]);

            if (allCalendars.length > 0) {
                setHolidays(allCalendars[0].holidays || []);
            }
            setAbsenceTypes(absenceTypesData.filter(t => !t.isDisabled));
            setRequests(requestsData.filter(r => r.employeeId === FAKE_EMPLOYEE.id));

        } catch (error) {
            console.error("Failed to load data from DB", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudieron cargar los datos de ausencias.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [toast]);

    const handleRequestSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!dateRange?.from || !formData.absenceTypeId) {
            toast({ variant: 'destructive', title: 'Faltan datos', description: 'Por favor, selecciona un tipo y un rango de fechas.'});
            return;
        }

        setIsSubmitting(true);
        const selectedType = absenceTypes.find(t => t.id === formData.absenceTypeId);

        try {
            const payload = {
                employeeId: FAKE_EMPLOYEE.id,
                employeeName: FAKE_EMPLOYEE.name,
                absenceTypeId: formData.absenceTypeId,
                absenceTypeName: selectedType?.name || 'Desconocido',
                startDate: format(dateRange.from, 'yyyy-MM-dd'),
                endDate: format(dateRange.to || dateRange.from, 'yyyy-MM-dd'),
                reason: formData.reason,
            };
            await createAbsenceRequest(payload);
            toast({ title: "Solicitud enviada", description: "Tu solicitud ha sido enviada para su aprobación." });
            await fetchData();
            setIsDialogOpen(false);
            setFormData({ absenceTypeId: '', reason: ''});
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo enviar la solicitud.'});
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const approvedAbsences = requests
        .filter(r => r.status === 'Aprobado')
        .flatMap(r => {
            const dates = [];
            let currentDate = parseISO(r.startDate);
            const endDate = parseISO(r.endDate);
            while(currentDate <= endDate) {
                dates.push(new Date(currentDate));
                currentDate = addDays(currentDate, 1);
            }
            return dates;
        });

    const holidayDates = holidays.map(h => parseISO(h.date));
    
    const modifiers = {
        approved: approvedAbsences,
        holiday: holidayDates,
    };
    const modifiersClassNames = {
        approved: 'bg-accent text-accent-foreground rounded-md',
        holiday: 'bg-destructive text-destructive-foreground rounded-md',
    };

    function DayWithTooltip(props: DayProps) {
        const buttonRef = useRef<HTMLButtonElement>(null);
        const dayRender = useDayRender(props.date, props.displayMonth, buttonRef);
        const holiday = holidays.find(h => isSameDay(parseISO(h.date), props.date));

        if (dayRender.isHidden) return <></>;
        if (!dayRender.isButton) return <div {...dayRender.divProps} />;

        const dayButton = <button {...dayRender.buttonProps} ref={buttonRef} />;

        if (holiday) {
            return (
                <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger asChild>{dayButton}</TooltipTrigger>
                        <TooltipContent><p>{holiday.name}</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        }
        return dayButton;
    }


    return (
    <div className="space-y-8">
       <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Mis Ausencias</h1>
                <p className="text-muted-foreground">Consulta tu historial, balance y solicita nuevo tiempo libre.</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Solicitar Ausencia
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle>Nueva Solicitud de Ausencia</DialogTitle>
                        <DialogDescription>
                            Selecciona el tipo de ausencia y las fechas.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleRequestSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="absence-type">Tipo de Ausencia</Label>
                            <Select name="absenceTypeId" value={formData.absenceTypeId} onValueChange={(value) => setFormData(prev => ({ ...prev, absenceTypeId: value }))} required>
                                <SelectTrigger id="absence-type">
                                    <SelectValue placeholder="Seleccionar tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {absenceTypes.map(type => (
                                        <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="date-range">Fechas</Label>
                             <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    id="date-range"
                                    variant={"outline"}
                                    className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !dateRange && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange?.from ? (
                                    dateRange.to ? (
                                        <>
                                        {format(dateRange.from, "d MMMM, yyyy", { locale: es })} -{" "}
                                        {format(dateRange.to, "d MMMM, yyyy", { locale: es })}
                                        </>
                                    ) : (
                                        format(dateRange.from, "d MMMM, yyyy", { locale: es })
                                    )
                                    ) : (
                                    <span>Selecciona un rango de fechas</span>
                                    )}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={2}
                                    disabled={isLoading}
                                />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reason">Motivo (opcional)</Label>
                            <Textarea id="reason" placeholder="Escribe un breve motivo para tu solicitud..." value={formData.reason} onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Enviar Solicitud
                        </Button>
                    </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {balances.map(balance => (
            <Card key={balance.type} className="bg-gradient-accent-to-card">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{balance.type}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{balance.total - balance.used} <span className="text-sm font-normal text-muted-foreground">/ {balance.total} días restantes</span></p>
                </CardContent>
            </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
            <Card className="bg-gradient-accent-to-card">
                <CardHeader>
                    <CardTitle>Mis Solicitudes</CardTitle>
                    <CardDescription>Historial de tus solicitudes de ausencia.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Fechas</TableHead>
                            <TableHead className="text-right">Estado</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={3} className="h-24 text-center"><Loader2 className="animate-spin"/></TableCell></TableRow>
                        ) : requests.length > 0 ? (
                            requests.map((request) => (
                                <TableRow key={request.id}>
                                <TableCell className="font-medium">{request.absenceTypeName}</TableCell>
                                <TableCell>{format(parseISO(request.startDate), 'd MMM', { locale: es })} - {format(parseISO(request.endDate), 'd MMM, yyyy', { locale: es })}</TableCell>
                                <TableCell className="text-right">
                                    <Badge
                                    className={cn(
                                        request.status === "Aprobado" && "bg-accent text-accent-foreground",
                                        request.status === "Pendiente" && "bg-warning text-warning-foreground",
                                        request.status === "Rechazado" && "bg-destructive text-destructive-foreground",
                                        "border-transparent"
                                    )}
                                    >{request.status}</Badge>
                                </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={3} className="h-24 text-center">No tienes solicitudes.</TableCell></TableRow>
                        )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-2">
            <Card className="bg-gradient-accent-to-card">
                 <CardHeader>
                    <CardTitle>Mi Calendario</CardTitle>
                    <CardDescription>Tus ausencias y festivos de un vistazo.</CardDescription>
                </CardHeader>
                <CardContent>
                     {isLoading ? (
                        <div className="flex items-center justify-center h-[280px]">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        <Calendar
                            mode="multiple"
                            modifiers={modifiers}
                            modifiersClassNames={modifiersClassNames}
                            className="rounded-lg border"
                            components={{ Day: DayWithTooltip }}
                        />
                    )}
                    <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded-full bg-destructive" />
                            <span>Festivo</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded-full bg-accent" />
                            <span>Ausencia Aprobada</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
