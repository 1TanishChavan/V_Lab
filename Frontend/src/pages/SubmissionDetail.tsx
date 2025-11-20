import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Editor } from "@monaco-editor/react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb";
import { useToast } from "../components/hooks/use-toast";
import api from "../services/api";
import { Loader2, Slash } from "lucide-react";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";

// Define interfaces for better type safety
interface Practical {
  practical_id: number;
  sr_no: number;
  practical_name: string;
  course_name: string;
  description: string;
  prac_io: { input: string; output: string }[];
}

interface Submission {
  submission_id: number;
  studentName: string;
  rollId: string;
  language: string;
  code: string;
  status: string;
  marks: number;
}

const PracticalSubmissionDetailsPage = () => {
  const { practicalId, submissionId } = useParams();
  const { toast } = useToast();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [practical, setPractical] = useState<Practical | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);

  // Form State
  const [status, setStatus] = useState("");
  const [marks, setMarks] = useState(0);

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        const [practicalRes, submissionRes] = await Promise.all([
          api.get(`/practicals/${practicalId}`),
          api.get(`/submissions/${submissionId}`),
        ]);

        setPractical(practicalRes.data);
        setSubmission(submissionRes.data);

        // Initialize form state
        setStatus(submissionRes.data.status || "Pending");
        setMarks(submissionRes.data.marks || 0);
      } catch (error) {
        console.error("Error fetching details:", error);
        toast({
          title: "Error",
          description: "Failed to load submission details.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (practicalId && submissionId) {
      fetchDetails();
    }
  }, [practicalId, submissionId]);

  const handleUpdateSubmission = async () => {
    setIsSubmitting(true);
    try {
      await api.put(`/submissions/${submissionId}`, {
        status,
        marks,
      });
      toast({
        title: "Success",
        description: "Submission updated successfully",
      });
    } catch (error) {
      console.error("Error updating submission:", error);
      toast({
        title: "Error",
        description: "Failed to update submission",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!practical || !submission) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Details not found.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <Slash />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href="/courses">Courses</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <Slash />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/practical-submission/${practicalId}`}>
              Submissions
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <Slash />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <span className="font-medium text-foreground">Review</span>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {practical.course_name}
        </h1>
        <h2 className="text-xl text-muted-foreground">
          Practical {practical.sr_no}: {practical.practical_name}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content: Code Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submitted Code</CardTitle>
              <CardDescription>Language: {submission.language}</CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-hidden">
              <Editor
                height="500px"
                language={submission.language.toLowerCase()} // Monaco expects lowercase
                value={submission.code}
                theme="vs-dark"
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontFamily: "'Fira Code', monospace",
                  fontSize: 14,
                  padding: { top: 16, bottom: 16 },
                  scrollBeyondLastLine: false,
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Cases</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {practical.prac_io.map((testCase, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg border"
                >
                  <div>
                    <span className="text-xs font-semibold uppercase text-muted-foreground">
                      Input
                    </span>
                    <pre className="mt-1 text-sm font-mono bg-background p-2 rounded border overflow-x-auto">
                      {testCase.input}
                    </pre>
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase text-muted-foreground">
                      Expected Output
                    </span>
                    <pre className="mt-1 text-sm font-mono bg-background p-2 rounded border overflow-x-auto">
                      {testCase.output}
                    </pre>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Details & Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-1">
                <span className="text-sm font-medium text-muted-foreground">
                  Name
                </span>
                <span className="text-base font-medium">
                  {submission.studentName}
                </span>
              </div>
              <div className="grid gap-1">
                <span className="text-sm font-medium text-muted-foreground">
                  Roll ID
                </span>
                <span className="text-base font-medium">
                  {submission.rollId}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Grading</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Accepted">Accepted</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Marks</Label>
                <Input
                  type="number"
                  value={marks}
                  onChange={(e) => setMarks(parseInt(e.target.value) || 0)}
                  min={0}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleUpdateSubmission}
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update Result
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PracticalSubmissionDetailsPage;
