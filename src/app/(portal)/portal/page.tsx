import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarDays, CheckSquare, Briefcase } from "lucide-react";
import { ClockWidget } from "./clock-widget";
import { mockTasks, mockAbsences } from "@/lib/data";

export default async function PortalPage() {
    const user = await getSession();
    if (!user) redirect('/login');

    const pendingTasks = mockTasks.filter(t => t.status !== 'Completed').length;
    const pendingAbsences = mockAbsences.filter(a => a.status === 'Pending').length;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline">Welcome, {user.name?.split(' ')[0]}!</h1>
                <p className="text-muted-foreground">Here's what's happening today.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <ClockWidget />
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                        <CheckSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingTasks}</div>
                        <p className="text-xs text-muted-foreground">Tasks requiring your attention</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Absence Requests</CardTitle>
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingAbsences}</div>
                        <p className="text-xs text-muted-foreground">Requests awaiting approval</p>
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
                 <Card>
                    <CardHeader>
                        <CardTitle>Your Tasks</CardTitle>
                        <CardDescription>A quick look at your current tasks.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <ul className="space-y-2">
                           {mockTasks.slice(0,3).map(task => (
                               <li key={task.id} className="flex items-center justify-between text-sm">
                                   <span>{task.title}</span>
                                   <span className="text-muted-foreground">{task.status}</span>
                               </li>
                           ))}
                       </ul>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Absences</CardTitle>
                        <CardDescription>Your recent and upcoming time off.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <ul className="space-y-2">
                           {mockAbsences.slice(0,3).map(absence => (
                               <li key={absence.id} className="flex items-center justify-between text-sm">
                                   <span>{absence.type} ({absence.startDate.toLocaleDateString()})</span>
                                   <span className="text-muted-foreground">{absence.status}</span>
                               </li>
                           ))}
                       </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
