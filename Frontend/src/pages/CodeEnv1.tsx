import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom"; // Added Link for breadcrumbs
import { Editor } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/hooks/use-toast";
import api from "../services/api";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/toaster";
import { Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Define types for better safety
interface PracticalDetails {
  course_name: string;
  practical_name: string;
  description: string;
  sr_no: number;
  semester: number;
  prac_io: { input: string; output: string; isPublic: boolean }[];
}

interface Language {
  programming_language_id: number;
  language_name: string;
}

const CodingEnvironmentPage = () => {
  const { courseId, practicalId } = useParams();
  const { user } = useAuthStore();
  const { toast } = useToast();

  // 1. Consolidated Page State
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [details, setDetails] = useState<PracticalDetails | null>(null);
  const [languages, setLanguages] = useState<Language[]>([]);

  // 2. Editor State
  const [language, setLanguage] = useState("");
  const [code, setCode] = useState("");
  const [customInput, setCustomInput] = useState("");

  // 3. Execution/Submission State
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const [showSubmissionStatus, setShowSubmissionStatus] = useState(false);
  const [runOutput, setRunOutput] = useState<{
    time: string;
    memory: number;
    output: string;
  } | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [previousSubmission, setPreviousSubmission] = useState<{
    code?: string;
    status?: string;
    submission_id?: number;
    marks?: number;
    submission_time: any;
  } | null>(null);

  const MAX_POLL_ATTEMPTS = 10;
  const POLL_INTERVAL = 8000;

  // Unified Data Fetching
  useEffect(() => {
    const loadPageData = async () => {
      setIsPageLoading(true);
      try {
        // Parallel fetch for independent data
        const [detailsRes, languagesRes, prevSubRes] = await Promise.all([
          api.get(`/practicals/${practicalId}`),
          api.get(`/practicals/${practicalId}/languages`),
          api
            .get(`/submissions/previous/${practicalId}`)
            .catch(() => ({ data: null })), // Allow this to fail/return null without blocking page
        ]);

        // 1. Set Details
        setDetails(detailsRes.data);

        // 2. Set Languages & Default Selection
        const fetchedLangs = languagesRes.data || [];
        setLanguages(fetchedLangs);

        // 3. Handle Previous Submission (Logic moved here to prevent race conditions with language setting)
        let initialCode = "";
        let initialLanguage =
          fetchedLangs.length > 0
            ? fetchedLangs[0].programming_language_id.toString()
            : "";

        if (prevSubRes.data && prevSubRes.data.code) {
          const sub = prevSubRes.data;
          setPreviousSubmission(sub);
          initialCode = sub.code;

          // If we had a previous submission, we should try to match the language if stored (optional, backend might not send lang id back)
          // For now, we stick to default or previous logic.

          if (sub.status) {
            setSubmissionStatus(sub.status);
            setShowSubmissionStatus(true);
          }
        } else if (
          prevSubRes.data?.message === "No previous submission found"
        ) {
          toast({
            title: "Information",
            description: "Start your first submission!",
            variant: "default",
          });
        }

        setCode(initialCode);
        setLanguage(initialLanguage);
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Failed to load practical data. Please refresh.",
          variant: "destructive",
        });
      } finally {
        setIsPageLoading(false);
      }
    };

    if (practicalId) {
      loadPageData();
    }
  }, [practicalId]); // Removed toast dependency to avoid lint warnings

  const pollSubmissionStatus = async (submissionId: any) => {
    try {
      let attempts = 0;
      while (attempts < MAX_POLL_ATTEMPTS) {
        const response = await api.get(
          `/submissions/${
            submissionId === undefined
              ? previousSubmission?.submission_id
              : submissionId
          }/status`
        );

        if (response.data.completed) {
          setSubmissionStatus(response.data.status);
          setShowSubmissionStatus(true);
          return response.data.status;
        }

        attempts++;
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
      }
      throw new Error("Polling timeout");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get submission status",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Login required.",
        variant: "destructive",
      });
      return;
    }
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Code cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    if (previousSubmission?.status === "Accepted") {
      toast({
        title: "Completed",
        description: "This practical is already accepted.",
        variant: "default",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmissionStatus(null);
      setShowSubmissionStatus(true);

      const response = await api.post("/submissions/submit-code", {
        practicalId,
        language,
        code,
        studentId: user.user_id,
        submissionId: previousSubmission?.submission_id || -1,
      });

      const status = await pollSubmissionStatus(response.data.submissionId);

      if (status) {
        setPreviousSubmission((prev) => ({
          ...prev,
          status: status,
          code: code,
          submission_id: response.data.submissionId,
          submission_time: new Date(),
        }));

        toast({
          title: status === "Accepted" ? "Success" : "Result",
          description:
            status === "Accepted"
              ? "Submission Accepted!"
              : "Submission Rejected.",
          variant: status === "Accepted" ? "default" : "destructive",
        });
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast({
          title: "Rate Limit",
          description: "Please wait before submitting again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to submit code.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRun = async () => {
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Code cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsRunning(true);
      setRunOutput(null);

      const response = await api.post("/submissions/run", {
        code,
        language: parseInt(language, 10),
        input: customInput,
        userId: user?.user_id,
      });

      setRunOutput({
        output: response.data.output,
        status: response.data.status,
        time: response.data.time,
        memory: response.data.memory,
      });
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast({
          title: "Rate Limit",
          description: "Please wait before running again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to run code.",
          variant: "destructive",
        });
      }
    } finally {
      setIsRunning(false);
    }
  };

  const getLanguageName = (languageId: string) => {
    return (
      languages.find(
        (lang) => lang.programming_language_id.toString() === languageId
      )?.language_name || ""
    );
  };

  if (isPageLoading || !details) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading Environment...</p>
        </div>
      </div>
    );
  }

  const publicTestCases = details.prac_io.filter((io) => io.isPublic);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <span className="font-normal">Semester {details.semester}</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Link
              to={`/course/${courseId}`}
              className="hover:text-foreground transition-colors"
            >
              {details.course_name}
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <span className="font-medium text-foreground">
              Practical {details.sr_no}
            </span>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Description */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold">{details.practical_name}</h2>
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap leading-relaxed">
                {details.description}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Test Cases */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Public Test Cases</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {publicTestCases.length > 0 ? (
                publicTestCases.map((testCase, index) => (
                  <div
                    key={index}
                    className="p-3 bg-muted/50 rounded-md border text-sm"
                  >
                    <div className="mb-2">
                      <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                        Input
                      </span>
                      <div className="font-mono mt-1 bg-background p-2 rounded border">
                        {testCase.input}
                      </div>
                    </div>
                    <div>
                      <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                        Expected Output
                      </span>
                      <div className="font-mono mt-1 bg-background p-2 rounded border">
                        {testCase.output}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No public test cases available.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Editor Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-2 rounded-lg border">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Select language">
                {getLanguageName(language) || "Select language"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              <SelectGroup>
                <SelectLabel>Languages</SelectLabel>
                {languages.map((lang) => (
                  <SelectItem
                    key={lang.programming_language_id}
                    value={lang.programming_language_id.toString()}
                  >
                    {lang.language_name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              onClick={handleRun}
              variant="secondary"
              disabled={isRunning || isSubmitting}
              className="flex-1 sm:flex-none min-w-[100px]"
            >
              {isRunning ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isRunning ? "Running..." : "Run"}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || isRunning}
              className="flex-1 sm:flex-none min-w-[100px]"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>

        {/* Status Banner */}
        {showSubmissionStatus && submissionStatus && (
          <div
            className={cn(
              "p-4 rounded-lg border flex items-center justify-between animate-in fade-in slide-in-from-top-2",
              submissionStatus === "Accepted"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">
                Status: {submissionStatus}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSubmissionStatus(false)}
              className={cn(
                "h-8 w-8 p-0 hover:bg-transparent",
                submissionStatus === "Accepted"
                  ? "hover:text-green-900"
                  : "hover:text-red-900"
              )}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="border rounded-lg overflow-hidden h-[500px]">
          <Editor
            height="100%"
            language={getLanguageName(language).toLowerCase()} // Monaco might need mapping, but usually safe for common langs
            value={code}
            onChange={(val) => setCode(val || "")}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              wordWrap: "on",
              automaticLayout: true,
              padding: { top: 16, bottom: 16 },
            }}
          />
        </div>

        {/* Input / Output Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Custom Input
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Enter input for your code..."
                className="font-mono min-h-[150px] resize-none"
              />
            </CardContent>
          </Card>

          <Card
            className={cn("transition-colors", runOutput ? "bg-slate-50" : "")}
          >
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Output
              </CardTitle>
              {runOutput && (
                <span className="text-xs text-muted-foreground font-mono">
                  {runOutput.time}s | {Math.round(runOutput.memory / 1024)} MB
                </span>
              )}
            </CardHeader>
            <CardContent>
              {runOutput ? (
                <div className="bg-background p-3 rounded-md border min-h-[150px] overflow-auto max-h-[300px]">
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {runOutput.output}
                  </pre>
                </div>
              ) : (
                <div className="flex items-center justify-center min-h-[150px] text-muted-foreground text-sm border-2 border-dashed rounded-md">
                  Run code to see output
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default CodingEnvironmentPage;
