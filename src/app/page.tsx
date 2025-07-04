import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ArrowUpRight, CheckCircle, Clock, Users, Zap } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  const chartData = [
    { name: "Mon", hours: 180 },
    { name: "Tue", hours: 195 },
    { name: "Wed", hours: 210 },
    { name: "Thu", hours: 200 },
    { name: "Fri", hours: 220 },
    { name: "Sat", hours: 40 },
    { name: "Sun", hours: 10 },
  ]

  const recentActivities = [
    { name: "Olivia Martin", activity: "clocked in", time: "5m ago", avatar: "OM" },
    { name: "Jackson Lee", activity: "requested time off", time: "15m ago", avatar: "JL" },
    { name: "Isabella Nguyen", activity: "completed 'UI Design' task", time: "30m ago", avatar: "IN" },
    { name: "William Kim", activity: "is on break", time: "45m ago", avatar: "WK" },
    { name: "Sophia Davis", activity: "clocked out", time: "1h ago", avatar: "SD" },
  ]
  
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">An overview of all management tasks for your team.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42 / 50</div>
            <p className="text-xs text-muted-foreground">+2 since last hour</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects In Progress</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">+1 since yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">3 vacation, 9 time changes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tasks Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87</div>
            <p className="text-xs text-muted-foreground">+15% from last week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Team Hours Overview</CardTitle>
            <CardDescription>Total hours logged this week.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}h`}
                />
                <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Recent Activity</CardTitle>
            <CardDescription>What your team has been up to.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={`https://placehold.co/40x40.png`} data-ai-hint="people avatar" alt="Avatar" />
                    <AvatarFallback>{activity.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{activity.name}</p>
                    <p className="text-sm text-muted-foreground">{activity.activity}</p>
                  </div>
                  <div className="ml-auto font-medium text-xs text-muted-foreground">{activity.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

       <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="font-headline">Team Overview</CardTitle>
                <CardDescription>
                  A quick look at your team's current status.
                </CardDescription>
              </div>
              <Button asChild size="sm">
                <Link href="/employees">
                  View All
                  <ArrowUpRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="text-right">Schedule</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <div className="font-medium">Liam Johnson</div>
                    <div className="text-sm text-muted-foreground hidden md:inline">liam@workflow.com</div>
                  </TableCell>
                  <TableCell>Engineering</TableCell>
                  <TableCell className="hidden sm:table-cell"><Badge variant="secondary" className="bg-green-100 text-green-800">Clocked In</Badge></TableCell>
                  <TableCell className="text-right">9:00 AM - 5:00 PM</TableCell>
                </TableRow>
                 <TableRow>
                  <TableCell>
                    <div className="font-medium">Emma Wilson</div>
                    <div className="text-sm text-muted-foreground hidden md:inline">emma@workflow.com</div>
                  </TableCell>
                  <TableCell>Marketing</TableCell>
                  <TableCell className="hidden sm:table-cell"><Badge variant="secondary" className="bg-green-100 text-green-800">Clocked In</Badge></TableCell>
                  <TableCell className="text-right">10:00 AM - 6:00 PM</TableCell>
                </TableRow>
                 <TableRow>
                  <TableCell>
                    <div className="font-medium">Noah Brown</div>
                    <div className="text-sm text-muted-foreground hidden md:inline">noah@workflow.com</div>
                  </TableCell>
                  <TableCell>Design</TableCell>
                  <TableCell className="hidden sm:table-cell"><Badge variant="secondary" className="bg-yellow-100 text-yellow-800">On Break</Badge></TableCell>
                  <TableCell className="text-right">9:30 AM - 5:30 PM</TableCell>
                </TableRow>
                 <TableRow>
                  <TableCell>
                    <div className="font-medium">Ava Smith</div>
                    <div className="text-sm text-muted-foreground hidden md:inline">ava@workflow.com</div>
                  </TableCell>
                  <TableCell>Sales</TableCell>
                   <TableCell className="hidden sm:table-cell"><Badge variant="outline">Clocked Out</Badge></TableCell>
                  <TableCell className="text-right">9:00 AM - 5:00 PM</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
    </div>
  )
}
