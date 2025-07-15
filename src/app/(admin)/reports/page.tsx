import { ReportGenerator } from './report-generator';

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Reports</h1>
        <p className="text-muted-foreground">Generate custom reports using AI.</p>
      </div>
      <ReportGenerator />
    </div>
  );
}
