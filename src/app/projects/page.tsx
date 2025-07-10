
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { type Project, listProjects, createProject } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const mockProjects: Project[] = [
    { id: "1", name: "Rediseño del Sitio Web", description: "Modernizar la interfaz de usuario y la experiencia del sitio web corporativo." },
    { id: "2", name: "Lanzamiento de App Móvil Q3", description: "Desarrollar y lanzar la aplicación móvil para iOS y Android." },
    { id: "3", name: "Campaña de Marketing de Verano", description: "Ejecutar campaña multicanal para aumentar las ventas de verano." },
    { id: "4", name: "Migración a Nueva Infraestructura", description: "Mover todos los servicios a la nueva arquitectura en la nube." },
    { id: "5", name: "Programa de Certificación Interna", description: "Crear un programa de certificación para el equipo de desarrollo." },
];


export default function ProjectsPage() {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [isLoading, setIsLoading] = useState(false); // Using mock data
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [newProjectData, setNewProjectData] = useState({
    name: "",
    description: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewProjectData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectData.name) return;

    // This is a local update for the mock data
    const newProject: Project = {
        id: (projects.length + 1).toString(),
        name: newProjectData.name,
        description: newProjectData.description,
    };
    setProjects(prev => [...prev, newProject]);
    setIsDialogOpen(false);
    setNewProjectData({ name: "", description: "" });
    toast({ title: "Proyecto creado", description: `El proyecto "${newProject.name}" ha sido creado.` });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proyectos</h1>
          <p className="text-muted-foreground">Crea, gestiona y haz seguimiento de los proyectos de tu equipo.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nuevo Proyecto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
              <DialogDescription>
                Completa los detalles a continuación.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Proyecto</Label>
                  <Input id="name" value={newProjectData.name} onChange={handleInputChange} placeholder="Ej., Campaña de Marketing T4" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea id="description" value={newProjectData.description} onChange={handleInputChange} placeholder="Describe brevemente el proyecto." />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Crear Proyecto</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
            Array.from({length: 3}).map((_, i) => (
                <Card key={i} className="bg-gradient-accent-to-card flex flex-col">
                    <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                    </CardHeader>
                    <CardContent className="flex-grow space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-10 w-full" />
                    </CardFooter>
                </Card>
            ))
        ) : projects.map((project) => (
          <Card key={project.id} className="bg-gradient-accent-to-card flex flex-col">
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription>{project.description}</CardDescription>
            </CardContent>
            <CardFooter>
              <Button asChild variant="secondary" className="w-full">
                <Link href={`/projects/${project.id}`}>
                    Ver Detalles
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
         {!isLoading && projects.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-12">
                <p>No se han creado proyectos. ¡Crea el primero!</p>
            </div>
        )}
      </div>
    </div>
  )
}

    