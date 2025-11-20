import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useToast } from "../components/hooks/use-toast";
import api from "../services/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Breadcrumb,
  BreadcrumbSeparator,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "../components/ui/breadcrumb";
import { Loader2, Slash } from "lucide-react";

const PracticalSubmissionDetails = () => {
  const { practicalId, submissionId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  // State
  const [submission, setSubmission] = useState<any>(null);
  const [status, setStatus] = useState("");
  const [marks, setMarks] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSubmissionDetails = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/submissions/${submissionId}`);
        setSubmission(response.data);
        setStatus(response.data.submission_status || response.data.status); // Handle distinct naming if API varies
        setMarks(response.data.marks?.toString() || "0");
      } catch (error) {
        console.error("Error fetching submission details:", error);
        toast({
          title: "Error",
          description: "Failed to fetch submission details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (submissionId) {
      fetchSubmissionDetails();
    }
  }, [submissionId]);

  const handleUpdate = async () => {
    setIsSubmitting(true);
    try {
      await api.put(`/submissions/${submissionId}`, {
        status,
        marks: parseInt(marks) || 0,
      });
      toast({
        title: "Success",
        description: "Submission updated successfully.",
      });
      // Navigate back to the list could be a good UX choice here, or stay on page
      // navigate(-1);
    } catch (error) {
      console.error("Error updating submission:", error);
      toast({
        title: "Error",
        description: "Failed to update submission. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !submission) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading Submission...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-4 p-4">
      <Breadcrumb className="mb-6">
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
            <span className="font-medium text-foreground">
              {submission.student_name}'s Submission
            </span>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Submission Details</span>
            <span
              className={`text-sm px-3 py-1 rounded-full border ${
                status === "Accepted"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : status === "Rejected"
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-yellow-50 text-yellow-700 border-yellow-200"
              }`}
            >
              {status}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Meta Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/30 rounded-lg">
              <div className="space-y-1">
                <Label className="text-muted-foreground">Student Name</Label>
                <div className="font-medium">{submission.student_name}</div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Roll ID</Label>
                <div className="font-medium">{submission.roll_id}</div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Course</Label>
                <div className="font-medium">{submission.course_name}</div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Practical</Label>
                <div className="font-medium">
                  {submission.practical_sr_no}. {submission.practical_name}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Submission Time</Label>
                <div className="font-medium">
                  {new Date(submission.submission_time).toLocaleString()}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Batch</Label>
                <div className="font-medium">{submission.batch_name}</div>
              </div>
            </div>

            {/* Inputs/Outputs */}
            <div className="space-y-2">
              <Label>Practical Input/Output:</Label>
              <div className="bg-muted/50 p-3 rounded-md border text-sm font-mono whitespace-pre-wrap">
                {submission.prac_io || "No public test cases used."}
              </div>
            </div>

            {/* Code Block */}
            <div className="space-y-2">
              <Label>Code Submitted:</Label>
              <div className="bg-zinc-950 text-zinc-50 p-4 rounded-md overflow-x-auto max-h-[400px] overflow-y-auto border border-zinc-800">
                <pre className="font-mono text-sm">
                  <code>{submission.code_submitted}</code>
                </pre>
              </div>
            </div>

            {/* Action Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="status">Status Update</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Accepted">Accepted</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="marks">Marks</Label>
                <Input
                  type="number"
                  id="marks"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  min={0}
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleUpdate}
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Submission
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PracticalSubmissionDetails;
