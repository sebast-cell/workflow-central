import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Folder, File, PenSquare, Upload, MoreHorizontal } from "lucide-react";

const folders = [
  { name: "Employment Documents", count: 12 },
  { name: "Paystubs", count: 48 },
  { name: "Receipts & Tickets", count: 34 },
  { name: "Justifications", count: 8 },
  { name: "ID & Check Photos", count: 21 },
];

const recentFiles = [
    { name: "Contract_Olivia_Martin.pdf", size: "2.1 MB", uploaded: "2024-08-10", signature: "Pending" },
    { name: "Receipt_August_Internet.png", size: "300 KB", uploaded: "2024-08-09", signature: null },
    { name: "Justification_Medical_JLee.pdf", size: "500 KB", uploaded: "2024-08-08", signature: "Signed" },
    { name: "Paystub_July_2024.pdf", size: "1.2 MB", uploaded: "2024-08-01", signature: null },
]

export default function DocumentsPage() {
  return (
    <div className="space-y-8">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight">Document Management</h1>
          <p className="text-muted-foreground">Upload, organize, and manage company and employee documents.</p>
        </div>
         <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {folders.map((folder, index) => (
            <Card key={index} className="hover:bg-muted/50 cursor-pointer transition-colors">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <Folder className="h-8 w-8 text-primary"/>
                        <span className="text-xs text-muted-foreground">{folder.count} files</span>
                    </div>
                    <p className="font-semibold mt-4">{folder.name}</p>
                </CardContent>
            </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="font-headline">Recently Uploaded Files</CardTitle>
            <CardDescription>A list of the most recently added documents.</CardDescription>
        </CardHeader>
        <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>File Name</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Date Uploaded</TableHead>
                        <TableHead>Signature Status</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recentFiles.map((file, index) => (
                        <TableRow key={index}>
                            <TableCell className="font-medium flex items-center gap-2">
                                <File className="h-4 w-4 text-muted-foreground"/>
                                {file.name}
                            </TableCell>
                            <TableCell>{file.size}</TableCell>
                            <TableCell>{file.uploaded}</TableCell>
                            <TableCell>
                                {file.signature ? (
                                    <Badge variant={file.signature === 'Signed' ? 'secondary' : 'default'} className={
                                        file.signature === 'Signed' ? 'bg-green-100 text-green-800' :
                                        file.signature === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''
                                    }>
                                        {file.signature}
                                    </Badge>
                                ) : (
                                   <span className="text-muted-foreground">-</span>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                {file.name.endsWith('.pdf') && !file.signature && (
                                    <Button variant="ghost" size="sm">
                                        <PenSquare className="mr-2 h-4 w-4"/>
                                        Request Signature
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  )
}
