import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { PlusCircle } from "lucide-react";

const projects = [
  { name: "Website Redesign", client: "Innovate Inc.", progress: 75, color: "bg-blue-500" },
  { name: "Mobile App Development", client: "Tech Solutions", progress: 40, color: "bg-purple-500" },
  { name: "Marketing Campaign", client: "Growth Co.", progress: 90, color: "bg-green-500" },
  { name: "API Integration", client: "Connective", progress: 25, color: "bg-orange-500" },
  { name: "Q3 Report Analysis", client: "Internal", progress: 100, color: "bg-gray-500" },
];

export default function ProjectsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Create, manage, and track your team's projects.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="font-headline">Create New Project</DialogTitle>
              <DialogDescription>
                Fill in the details below. More info leads to better reports.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Project Name</Label>
                <Input id="name" placeholder="e.g., Q4 Marketing Campaign" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="client" className="text-right">Client</Label>
                <Input id="client" placeholder="Optional" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="currency" className="text-right">Currency</Label>
                <Input id="currency" placeholder="e.g., USD" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Create Project</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="font-headline">{project.name}</CardTitle>
                  <CardDescription>{project.client}</CardDescription>
                </div>
                <div className={`w-4 h-4 rounded-full ${project.color}`}></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress value={project.progress} />
                <p className="text-sm text-muted-foreground">{project.progress}% complete</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="secondary" className="w-full">View Details</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
