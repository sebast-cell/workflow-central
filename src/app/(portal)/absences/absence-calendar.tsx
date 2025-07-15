'use client';

import { useState } from 'react';
import { addDays, format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface AbsenceCalendarProps {
  absenceDates: {
    startDate: Date;
    endDate: Date;
    status: string;
  }[];
}

export function AbsenceCalendar({ absenceDates }: AbsenceCalendarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 1),
  });
  const { toast } = useToast();

  const approvedDays = absenceDates.filter(d => d.status === "Approved").map(d => ({ from: d.startDate, to: d.endDate }));
  const pendingDays = absenceDates.filter(d => d.status === "Pending").map(d => ({ from: d.startDate, to: d.endDate }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would call an API to submit the absence request
    console.log("Submitting absence request for:", date);
    toast({
        title: "Request Submitted",
        description: "Your absence request has been sent for approval.",
    });
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-md border bg-card p-4 flex flex-col gap-4">
        <Calendar
          mode="multiple"
          modifiers={{ approved: approvedDays, pending: pendingDays }}
          modifiersStyles={{
              approved: { backgroundColor: 'hsl(var(--primary)/0.2)', color: 'hsl(var(--primary))' },
              pending: { backgroundColor: 'hsl(var(--accent)/0.2)', color: 'hsl(var(--accent-foreground))'},
          }}
          className="w-full"
        />
        <DialogTrigger asChild>
          <Button>Request Absence</Button>
        </DialogTrigger>
      </div>

      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
            <DialogHeader>
            <DialogTitle>Request Absence</DialogTitle>
            <DialogDescription>
                Select the dates and type of absence you are requesting.
            </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dates" className="text-right">
                Dates
                </Label>
                <div className="col-span-3">
                 <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={'outline'}
                        className={cn(
                        'w-full justify-start text-left font-normal',
                        !date && 'text-muted-foreground'
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                        date.to ? (
                            <>
                            {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
                            </>
                        ) : (
                            format(date.from, 'LLL dd, y')
                        )
                        ) : (
                        <span>Pick a date</span>
                        )}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                    />
                    </PopoverContent>
                </Popover>
                </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                Type
                </Label>
                <Select>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select absence type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="vacation">Vacation</SelectItem>
                        <SelectItem value="sick">Sick Leave</SelectItem>
                        <SelectItem value="personal">Personal Day</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                Notes
                </Label>
                <Textarea id="notes" placeholder="Optional notes for your manager" className="col-span-3" />
            </div>
            </div>
            <DialogFooter>
            <Button type="submit">Submit Request</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
