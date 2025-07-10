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

export default function ProjectsPage() {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [newProjectData, setNewProjectData] = useState({
    name: "",
    description: "",
  });

  const fetchData = async () => {
      setIsLoading(true);
      try {
          const projectsData = await listProjects();
          setProjects(projectsData);
      } catch (error) {
          console.error("Failed to fetch projects from API", error);
          toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los proyectos." });
      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewProjectData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectData.name) return;

    try {
        const savedProject = await createProject(newProjectData);
        setProjects(prev => [...prev, savedProject]);
        setIsDialogOpen(false);
        setNewProjectData({ name: "", description: "" });
        toast({ title: "Proyecto creado", description: `El proyecto "${savedProject.name}" ha sido creado.` });
    } catch (error) {
        console.error("Failed to create project:", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudo crear el proyecto." });
    }
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
