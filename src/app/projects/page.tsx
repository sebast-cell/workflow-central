'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";

type Task = {
    id: number;
    name: string;
    assignee: string;
    status: "Completado" | "En Progreso" | "Pendiente";
    hours: number;
};

type Project = {
    id: number;
    name: string;
    client: string;
    progress: number;
    color: string;
    members: string[];
    tasks: Task[];
};

const initialProjects: Project[] = [
  { id: 1, name: "Rediseño del Sitio Web", client: "Innovate Inc.", progress: 75, color: "bg-blue-500", members: ["OM", "JL", "IN"], tasks: [
    {id: 1, name: "Investigación y Análisis", assignee: "Olivia Martin", status: "Completado", hours: 20},
    {id: 2, name: "Diseño de Wireframes", assignee: "Jackson Lee", status: "En Progreso", hours: 15},
    {id: 3, name: "Desarrollo de Componentes UI", assignee: "Olivia Martin", status: "En Progreso", hours: 25},
    {id: 4, name: "Pruebas de Usuario", assignee: "Isabella Nguyen", status: "Pendiente", hours: 10},
  ] },
  { id: 2, name: "Desarrollo de App Móvil", client: "Tech Solutions", progress: 40, color: "bg-purple-500", members: ["WK", "SD"], tasks: [] },
  { id: 3, name: "Campaña de Marketing", client: "Growth Co.", progress: 90, color: "bg-green-500", members: ["IN", "LG"], tasks: [] },
  { id: 4, name: "Integración de API", client: "Connective", progress: 25, color: "bg-orange-500", members: ["WK"], tasks: [] },
  { id: 5, name: "Análisis de Informe T3", client: "Interno", progress: 100, color: "bg-gray-500", members: ["LG"], tasks: [] },
];

const projectColors = [
    { value: 'bg-blue-500', label: 'Azul' },
    { value: 'bg-purple-500', label: 'Morado' },
    { value: 'bg-green-500', label: 'Verde' },
    { value: 'bg-orange-500', label: 'Naranja' },
    { value: 'bg-red-500', label: 'Rojo' },
    { value: 'bg-gray-500', label: 'Gris' },
];

const PROJECTS_STORAGE_KEY = 'workflow-central-projects';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  const [newProjectData, setNewProjectData] = useState({
    name: "",
    client: "",
    currency: "USD",
    color: "bg-blue-500",
    isPrivate: false,
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewProjectData(prev => ({ ...prev, [id]: value }));
  };

  const handleColorChange = (value: string) => {
    setNewProjectData(prev => ({ ...prev, color: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setNewProjectData(prev => ({ ...prev, isPrivate: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectData.name) return;

    const newProject: Project = {
      id: projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1,
      name: newProjectData.name,
      client: newProjectData.client || "Interno",
      progress: 0,
      color: newProjectData.color,
      members: [],
      tasks: [],
    };

    setProjects(prev => [...prev, newProject]);
    setIsDialogOpen(false);
    setNewProjectData({
      name: "",
      client: "",
      currency: "USD",
      color: "bg-blue-500",
      isPrivate: false,
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
                Completa los detalles a continuación. Más información conduce a mejores informes.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Proyecto</Label>
                  <Input id="name" value={newProjectData.name} onChange={handleInputChange} placeholder="Ej., Campaña de Marketing T4" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client">Cliente</Label>
                  <Input id="client" value={newProjectData.client} onChange={handleInputChange} placeholder="Opcional" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Moneda</Label>
                  <Input id="currency" value={newProjectData.currency} onChange={handleInputChange} placeholder="Ej., USD" />
                </div>
                <div className="space-y-2">
                  <Label>Color del Proyecto</Label>
                  <RadioGroup value={newProjectData.color} onValueChange={handleColorChange} className="flex flex-wrap gap-4 pt-2">
                    {projectColors.map(color => (
                      <div key={color.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={color.value} id={color.value} className="h-6 w-6 border-0 p-0 data-[state=checked]:ring-2 ring-offset-background ring-ring">
                              <div className={`h-full w-full rounded-full ${color.value}`}></div>
                          </RadioGroupItem>
                          <Label htmlFor={color.value} className="cursor-pointer">{color.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="private-project" checked={newProjectData.isPrivate} onCheckedChange={handleSwitchChange} />
                  <Label htmlFor="private-project">Privatizar proyecto</Label>
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
          <Card key={project.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription>{project.client}</CardDescription>
                </div>
                <div className={`w-4 h-4 rounded-full ${project.color}`}></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress value={project.progress} />
                <p className="text-sm text-muted-foreground">{project.progress}% completado</p>
              </div>
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
