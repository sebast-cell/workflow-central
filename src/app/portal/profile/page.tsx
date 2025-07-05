import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function EmployeeProfilePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-muted-foreground">Consulta y actualiza tu información personal y de contacto.</p>
      </div>

      <Card>
        <CardHeader>
            <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage src="https://placehold.co/100x100.png" data-ai-hint="employee avatar" />
                    <AvatarFallback>OM</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-2xl">Olivia Martin</CardTitle>
                    <CardDescription>Desarrollador Frontend en el departamento de Ingeniería.</CardDescription>
                </div>
                <Button variant="outline" className="ml-auto">Cambiar Foto</Button>
            </div>
        </CardHeader>
        <CardContent>
            <form className="space-y-8">
                <div>
                    <h3 className="text-lg font-medium">Información Personal</h3>
                    <Separator className="my-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">Nombre</Label>
                            <Input id="firstName" defaultValue="Olivia" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Apellidos</Label>
                            <Input id="lastName" defaultValue="Martin" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" defaultValue="olivia.martin@example.com" readOnly />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono</Label>
                            <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" />
                        </div>
                    </div>
                </div>

                 <div>
                    <h3 className="text-lg font-medium">Dirección</h3>
                    <Separator className="my-4" />
                    <div className="space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="address">Dirección</Label>
                            <Input id="address" defaultValue="123 Main St" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">Ciudad</Label>
                                <Input id="city" defaultValue="Anytown" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state">Provincia</Label>
                                <Input id="state" defaultValue="CA" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="zip">Código Postal</Label>
                                <Input id="zip" defaultValue="12345" />
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-medium">Contacto de Emergencia</h3>
                    <Separator className="my-4" />
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="emergencyName">Nombre Completo</Label>
                            <Input id="emergencyName" defaultValue="John Doe" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="emergencyPhone">Teléfono</Label>
                            <Input id="emergencyPhone" type="tel" defaultValue="+1 (555) 987-6543" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="emergencyRelation">Relación</Label>
                            <Input id="emergencyRelation" defaultValue="Cónyuge" />
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-end">
                    <Button>Guardar Cambios</Button>
                </div>
            </form>
        </CardContent>
      </Card>
    </div>
  )
}
