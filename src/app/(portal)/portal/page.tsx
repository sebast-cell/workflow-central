'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowRight, ChevronLeft, Clock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { clockInAction, clockOutAction } from './actions';

function ClockWidget() {
    const { toast } = useToast();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState< 'in' | 'out' | null>(null);

    const handleClock = (type: 'in' | 'out') => {
        setIsLoading(type);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                if (!user) {
                    toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
                    setIsLoading(null);
                    return;
                }
                const { latitude, longitude } = position.coords;
                const action = type === 'in' ? clockInAction : clockOutAction;
                const result = await action({ userId: user.uid, latitude, longitude });

                if (result.success) {
                    toast({ title: `Clock ${type} successful!` });
                } else {
                    toast({ variant: 'destructive', title: 'Error', description: result.error });
                }
                setIsLoading(null);
            },
            (error) => {
                console.error("Geolocation error:", error);
                toast({
                    variant: 'destructive',
                    title: 'Geolocation Error',
                    description: 'Could not get your location. Please enable location services.',
                });
                setIsLoading(null);
            }
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Quick Clock-In
                </CardTitle>
                <CardDescription>Register your start and end of the day.</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
                <Button onClick={() => handleClock('in')} className="w-full bg-green-600 hover:bg-green-700" disabled={!!isLoading}>
                    {isLoading === 'in' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                    Clock In
                </Button>
                <Button onClick={() => handleClock('out')} className="w-full bg-red-600 hover:bg-red-700" disabled={!!isLoading}>
                    {isLoading === 'out' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ChevronLeft className="mr-2 h-4 w-4" />}
                    Clock Out
                </Button>
            </CardContent>
        </Card>
    );
}


export default function PortalPage() {
  const { userData } = useAuth();
  const router = useRouter();

  return (
    <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Employee Portal
        </h1>
        <p className="text-muted-foreground">
          Welcome back, {userData?.name}. Here are your shortcuts.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
            <ClockWidget />
            <Card>
                <CardHeader>
                    <CardTitle>Shortcuts</CardTitle>
                    <CardDescription>Manage your tasks and absences.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    <Button variant="outline" onClick={() => router.push('/portal/tasks')}>
                        View My Tasks
                    </Button>
                    <Button variant="outline" onClick={() => router.push('/portal/absences')}>
                        Request Absence
                    </Button>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
