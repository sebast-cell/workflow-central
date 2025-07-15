'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, LogIn, LogOut, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

export function ClockWidget() {
    const [status, setStatus] = useState<'clocked-in' | 'clocked-out'>('clocked-out');
    const [isLoading, setIsLoading] = useState(false);
    const [time, setTime] = useState(new Date());
    const { toast } = useToast();

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleClockIn = () => {
        setIsLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log('Clock-in Location:', position.coords.latitude, position.coords.longitude);
                // Here you would typically call an API to save the attendance record
                setTimeout(() => {
                    setStatus('clocked-in');
                    setIsLoading(false);
                    toast({ title: "Clocked In", description: "Your shift has started." });
                }, 1000);
            },
            (error) => {
                console.error("Geolocation error:", error);
                setIsLoading(false);
                toast({ variant: 'destructive', title: "Geolocation Error", description: "Could not get your location. Please enable location services." });
            }
        );
    };

    const handleClockOut = () => {
        setIsLoading(true);
        // API call to save clock-out time
        setTimeout(() => {
            setStatus('clocked-out');
            setIsLoading(false);
            toast({ title: "Clocked Out", description: "Your shift has ended." });
        }, 1000);
    };
    
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Time Tracking</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{time.toLocaleTimeString()}</div>
                <p className={`text-xs ${status === 'clocked-in' ? 'text-green-500' : 'text-muted-foreground'}`}>
                    You are currently {status === 'clocked-in' ? 'Clocked In' : 'Clocked Out'}
                </p>
            </CardContent>
            <CardFooter>
                 {status === 'clocked-out' ? (
                    <Button className="w-full" onClick={handleClockIn} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                        Clock In
                    </Button>
                ) : (
                    <Button className="w-full" variant="outline" onClick={handleClockOut} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
                        Clock Out
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
