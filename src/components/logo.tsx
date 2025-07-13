
import { Briefcase } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)}>
      <div className="bg-primary text-primary-foreground p-2 rounded-md">
        <Briefcase className="h-6 w-6" />
      </div>
      <h1 className="text-xl font-semibold">WorkFlow Central</h1>
    </Link>
  );
}
