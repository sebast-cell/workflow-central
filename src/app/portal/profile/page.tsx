
'use client';

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { type Employee, listEmployees, updateEmployee } from "@/lib/api";
import { Loader2 } from "lucide-react";


// In a real app, this ID would come from an authentication context.
// We are using a hardcoded ID for "Olivia Martin" for this example.
const FAKE_EMPLOYEE_ID = "1";

export default function EmployeeProfilePage() {
    const { toast } = useToast();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [formData, setFormData] = useState<Partial<Employee>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchEmployeeData = async () => {
            setIsLoading(true);
            try {
                // In a real app, this would be a direct `getEmployee(id)` call.
                // For now, we fetch all and find the one we need.
                const allEmployees = await listEmployees();
                const currentEmployee = allEmployees.find(e => e.id === FAKE_EMPLOYEE_ID);
                if (currentEmployee) {
                    setEmployee(currentEmployee);
                    setFormData(currentEmployee);
                } else {
                     toast({ variant: "destructive", title: "Error", description: "No se pudo encontrar el perfil del empleado." });
                }
            } catch (error) {
                 toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los datos del perfil." });
            } finally {
                setIsLoading(false);
            }
        };

        fetchEmployeeData();
    }, [toast]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!employee) return;
        
        setIsSubmitting(true);
        try {
            await updateEmployee(employee.id, formData);
            toast({ title: "Perfil Actualizado", description: "Tu información ha sido guardada correctamente." });
            // Optionally re-fetch data to confirm changes
            setEmployee(prev => prev ? { ...prev, ...formData } : null);
        } catch (error) {
            toast({ variant: "destructive", title: "Error al guardar", description: "No se pudo actualizar tu perfil." });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-8">
                <Skeleton className="h-10 w-1/3" />
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-16 w-16 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-7 w-48" />
                                <Skeleton className="h-5 w-32" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-96 w-full" />
                    </CardContent>
                </Card>
            </div>
        )
    }
    
    if (!employee) {
        return <p>No se encontró el perfil del empleado.</p>
    }

    return (
        <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
            <p className="text-muted-foreground">Consulta y actualiza tu información personal y de contacto.</p>
        </div>

        <Card className="bg-gradient-accent-to-card">
            <CardHeader>
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src="https://placehold.co/100x100.png" data-ai-hint="employee avatar" />
                        <AvatarFallback>{employee.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-2xl">{employee.name}</CardTitle>
                        <CardDescription>{employee.role} en {employee.department}.</CardDescription>
                    </div>
                    <Button variant="outline" className="ml-auto">Cambiar Foto</Button>
                </div>
            </CardHeader>
            <CardContent>
                <form className="space-y-8" onSubmit={handleFormSubmit}>
                    <div>
                        <h3 className="text-lg font-medium">Información Personal</h3>
                        <Separator className="my-4" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre Completo</Label>
                                <Input id="name" value={formData.name || ''} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Teléfono</Label>
                                <Input id="phone" type="tel" value={formData.phone || ''} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={formData.email || ''} readOnly disabled />
                            </div>
                        </div>
                    </div>

                    {/* Placeholder for Address fields - add later if needed */}
                    {/* 
                    <div>
                        <h3 className="text-lg font-medium">Dirección</h3>
                        ...
                    </div> 
                    */}

                    <div className="flex justify-end">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar Cambios
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
        </div>
    )
}
