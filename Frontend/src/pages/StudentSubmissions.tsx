import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { useToast } from "../components/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb";
import { Loader2, Slash } from "lucide-react";

// Define types
interface StudentDetails {
  name: string;
  roll_id: string;
  email: string;
  semester: number;
  division: string;
  batch: string;
}

interface Submission {
  submission_id: number;
  course_name: string;
  practical_sr_no: number;
  practical_name: string;
  submission_time: string;
  status: string;
  marks: number;
  practical_id: number;
}

const StudentSubmissionsPage = () => {
  const { studentId } = useParams();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [student, setStudent] = useState<StudentDetails | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch both endpoints in parallel for faster loading
        const [detailsRes, submissionsRes] = await Promise.all([
          api.get(`/submissions/student-details/${studentId}`),
          api.get(`/submissions/student/${studentId}`),
        ]);

        setStudent(detailsRes.data);
        setSubmissions(submissionsRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load student data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (studentId) {
      loadData();
    }
  }, [studentId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!student) return <div className="p-4 text-center">Student not found</div>;

  return (
    <div className="container mx-auto mt-4 p-4 space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <Slash />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href="/students">Students</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <Slash />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <span className="font-medium text-foreground">{student.name}</span>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader>
          <CardTitle>Student Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1">
              <span className="text-sm font-medium text-muted-foreground">
                Name
              </span>
              <p className="font-medium">{student.name}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm font-medium text-muted-foreground">
                Roll ID
              </span>
              <p className="font-medium">{student.roll_id}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm font-medium text-muted-foreground">
                Email
              </span>
              <p className="font-medium">{student.email}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm font-medium text-muted-foreground">
                Semester
              </span>
              <p className="font-medium">Sem {student.semester}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm font-medium text-muted-foreground">
                Division
              </span>
              <p className="font-medium">{student.division}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm font-medium text-muted-foreground">
                Batch
              </span>
              <p className="font-medium">{student.batch}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Submissions History
        </h2>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Practical</TableHead>
                <TableHead>Submitted On</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Marks</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.length > 0 ? (
                submissions.map((submission) => (
                  <TableRow key={submission.submission_id}>
                    <TableCell className="font-medium">
                      {submission.course_name}
                    </TableCell>
                    <TableCell>
                      {submission.practical_sr_no}. {submission.practical_name}
                    </TableCell>
                    <TableCell>
                      {new Date(submission.submission_time).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          submission.status === "Accepted"
                            ? "bg-green-100 text-green-800"
                            : submission.status === "Rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {submission.status}
                      </span>
                    </TableCell>
                    <TableCell>{submission.marks}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          to={`/practical-submission-details/${submission.practical_id}/${submission.submission_id}`}
                        >
                          View Details
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No submissions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default StudentSubmissionsPage;
