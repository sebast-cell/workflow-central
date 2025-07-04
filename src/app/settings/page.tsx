import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application settings.</p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="font-headline">Under Construction</CardTitle>
            <CardDescription>This section is currently being developed.</CardDescription>
        </CardHeader>
        <CardContent>
            <p>Come back soon to configure company details, roles, integrations, and more!</p>
        </CardContent>
      </Card>
    </div>
  )
}
