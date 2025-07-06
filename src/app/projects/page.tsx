'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";

type Project = {
    id: string;
    name: string;
    description: string;
};

const initialProjects: Project[] = [
  { id: "1", name: "Rediseño del Sitio Web", description: "Modernizar la interfaz de usuario y la experiencia del sitio web corporativo." },
  { id: "2", name: "Desarrollo de App Móvil", description: "Crear una aplicación móvil nativa para iOS y Android." },
  { id: "3", name: "Campaña de Marketing", description: "Campaña de marketing digital para el lanzamiento del nuevo producto en el T4." },
  { id: "4", name: "Integración de API", description: "Integrar un nuevo sistema de pagos de terceros." },
  { id: "5", name: "Análisis de Informe T3", description: "Proyecto interno para analizar los resultados del tercer trimestre." },
];

const PROJECTS_STORAGE_KEY = 'workflow-central-projects';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  const [newProjectData, setNewProjectData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      try {
        const storedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
        if (storedProjects) {
          setProjects(JSON.parse(storedProjects));
        } else {
          localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(initialProjects));
        }
      } catch (error) {
        console.error("Failed to access localStorage for projects", error);
      }
    }
  }, [isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    }
  }, [projects, isClient]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewProjectData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectData.name) return;

    const newProject: Project = {
      id: Date.now().toString(),
      name: newProjectData.name,
      description: newProjectData.description,
    };

    setProjects(prev => [...prev, newProject]);
    setIsDialogOpen(false);
    setNewProjectData({
      name: "",
      description: "",
    });
  };

  if (!isClient) {
    return null; // Or a loading skeleton
  }

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
        {projects.map((project) => (
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
      </div>
    </div>
  )
}
