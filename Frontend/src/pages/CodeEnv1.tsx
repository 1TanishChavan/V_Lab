import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Editor } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

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
import { Loader2 } from "lucide-react";

const CodingEnvironmentPage = () => {
  const { courseId, practicalId } = useParams();
  const [courseName, setCourseName] = useState("");
  const [practicalName, setPracticalName] = useState("");
  const [testCases, setTestCases] = useState([]);
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("");
  const [languages, setLanguages] = useState([]);
  const [code, setCode] = useState("");
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [customInput, setCustomInput] = useState("");
  const [runOutput, setRunOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResults, setSubmissionResults] = useState(null);

  // Maximum number of polling attempts and interval
  const MAX_POLL_ATTEMPTS = 30;
  const POLL_INTERVAL = 5000;

  useEffect(() => {
    const fetchPracticalDetails = async () => {
      try {
        const response = await api.get(`/practicals/${practicalId}`);
        const { course_name, practical_name, description, prac_io } =
          response.data;
        setCourseName(course_name);
        setPracticalName(practical_name);
        setDescription(description);
        setTestCases(prac_io.filter((io) => io.isPublic));
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch practical details",
          variant: "destructive",
        });
      }
    };

    const fetchPracticalLanguages = async () => {
      try {
        const response = await api.get(`/practicals/${practicalId}/languages`);
        const languagesData = response.data || [];
        setLanguages(languagesData);
        if (languagesData.length > 0) {
          // Fix: Correctly access the programming_language_id from the response
          const defaultLanguageId =
            languagesData[0].programming_language?.programming_language_id?.toString();
          if (defaultLanguageId) {
            setLanguage(defaultLanguageId);
          }
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch languages",
          variant: "destructive",
        });
      }
    };

    fetchPracticalDetails();
    fetchPracticalLanguages();
  }, [practicalId, toast]);

  const pollSubmissionStatus = async (submissionId) => {
    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
      try {
        const response = await api.get(`/submissions/${submissionId}/status`);
        const { status, completed, results } = response.data;

        if (completed) {
          setSubmissionStatus(status);
          setSubmissionResults(results);
          return;
        }

        // Update partial results
        if (results) {
          setSubmissionResults(results);
        }

        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
      } catch (error) {
        console.error("Error polling submission status:", error);

        if (error.response && error.response.status === 404) {
          setSubmissionStatus("Not Found");
          toast({
            title: "Error",
            description: "Submission not found. Please try submitting again.",
            variant: "destructive",
          });
          return;
        }

        // For other errors, continue polling
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
      }
    }

    setSubmissionStatus("Timeout");
    toast({
      title: "Timeout",
      description:
        "Submission processing took too long. Please try again later.",
      variant: "destructive",
    });
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit code.",
        variant: "destructive",
      });
      return;
    }

    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Please write some code before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmissionStatus(null);

      const response = await api.post("/submissions/submit-code", {
        practicalId,
        language,
        code,
        studentId: user.user_id,
      });

      if (response.data.alreadySubmitted) {
        toast({
          title: "Notice",
          description:
            "You have already submitted this practical successfully.",
        });
        setSubmissionStatus("Accepted");
        return;
      }

      await pollSubmissionStatus(response.data.submissionId);

      toast({
        title: submissionStatus === "Accepted" ? "Success" : "Not Accepted",
        description:
          submissionStatus === "Accepted"
            ? "Your submission has been accepted!"
            : submissionStatus === "Timeout"
            ? "Submission processing timed out. Please try again."
            : "Your submission was not accepted. Please check the results and try again.",
        variant: submissionStatus === "Accepted" ? "default" : "destructive",
      });
    } catch (error) {
      if (error.response?.status === 429) {
        toast({
          title: "Rate Limited",
          description: "Please wait 30 seconds before submitting again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to submit code",
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
        description: "Please write some code before running.",
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
        userId: user.user_id,
      });

      setRunOutput({
        output: response.data.output,
        status: response.data.status,
        time: response.data.time,
        memory: response.data.memory,
      });
    } catch (error) {
      if (error.response?.status === 429) {
        toast({
          title: "Rate Limited",
          description: "Please wait before running code again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to run code",
          variant: "destructive",
        });
      }
    } finally {
      setIsRunning(false);
    }
  };

  // const pollSubmissionStatus = async (submissionId) => {
  //   for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
  //     try {
  //       const response = await api.get(`/submissions/${submissionId}/status`);
  //       const { status, completed, results } = response.data;

  //       if (completed) {
  //         setSubmissionStatus(status);
  //         setSubmissionResults(results);
  //         return;
  //       }

  //       // Update partial results
  //       if (results) {
  //         setSubmissionResults(results);
  //       }

  //       await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
  //     } catch (error) {
  //       console.error("Error polling submission status:", error);
  //       throw new Error("Failed to get submission status");
  //     }
  //   }

  //   throw new Error("Polling timeout: Submission processing took too long");
  // };

  // const pollSubmissionStatus = async (submissionId) => {
  //   for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
  //     try {
  //       const response = await api.get(`/submissions/${submissionId}/status`);
  //       const { status, completed } = response.data;

  //       if (completed) {
  //         setSubmissionStatus(status);
  //         return;
  //       }

  //       await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
  //     } catch (error) {
  //       console.error("Error polling submission status:", error);
  //       throw new Error("Failed to get submission status");
  //     }
  //   }

  //   throw new Error("Polling timeout: Submission processing took too long");
  // };

  // const handleSubmit = async () => {
  //   if (!user) {
  //     toast({
  //       title: "Error",
  //       description: "You must be logged in to submit code.",
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   if (!code.trim()) {
  //     toast({
  //       title: "Error",
  //       description: "Please write some code before submitting.",
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   try {
  //     setIsSubmitting(true);
  //     setSubmissionStatus(null);

  //     const response = await api.post("/submissions/submit-code", {
  //       practicalId,
  //       language,
  //       code,
  //       studentId: user.user_id,
  //     });

  //     if (response.data.alreadySubmitted) {
  //       toast({
  //         title: "Notice",
  //         description:
  //           "You have already submitted this practical successfully.",
  //       });
  //       setSubmissionStatus("Accepted");
  //       return;
  //     }

  //     await pollSubmissionStatus(response.data.submissionId);

  //     toast({
  //       title: submissionStatus === "Accepted" ? "Success" : "Not Accepted",
  //       description:
  //         submissionStatus === "Accepted"
  //           ? "Your submission has been accepted!"
  //           : "Your submission was not accepted. Please try again.",
  //       variant: submissionStatus === "Accepted" ? "default" : "destructive",
  //     });
  //   } catch (error) {
  //     if (error.response?.status === 429) {
  //       toast({
  //         title: "Rate Limited",
  //         description: "Please wait 30 seconds before submitting again.",
  //         variant: "destructive",
  //       });
  //     } else {
  //       toast({
  //         title: "Error",
  //         description: error.response?.data?.message || "Failed to submit code",
  //         variant: "destructive",
  //       });
  //     }
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const getLanguageName = (languageId) => {
    const selectedLanguage = languages.find(
      (lang) =>
        lang.programming_language?.programming_language_id?.toString() ===
        languageId
    );
    return selectedLanguage?.programming_language?.language_name || "";
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{courseName}</h1>
      <h2 className="text-xl font-semibold mb-4">{practicalName} (Sr. No: )</h2>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{description}</p>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Public Test Cases</CardTitle>
        </CardHeader>
        <CardContent>
          {testCases.map((testCase, index) => (
            <div key={index} className="mb-2">
              <CardDescription>Input: {testCase.input}</CardDescription>
              <CardDescription>Output: {testCase.output}</CardDescription>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="mb-4">
        <Select
          value={language}
          onValueChange={(value) => {
            console.log("Selected language:", value); // Debug log
            setLanguage(value);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select language">
              {getLanguageName(language) || "Select language"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Languages</SelectLabel>
              {languages.map((lang) => (
                <SelectItem
                  key={lang.programming_language?.programming_language_id}
                  value={lang.programming_language?.programming_language_id?.toString()}
                >
                  {lang.programming_language?.language_name ||
                    "Unknown Language"}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <Editor
        height="400px"
        language={getLanguageName(language).toLowerCase()}
        value={code}
        onChange={setCode}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          rulers: [],
          wordWrap: "on",
          wrappingIndent: "indent",
          automaticLayout: true,
        }}
      />

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Custom Input</CardTitle>
              <CardDescription>Enter input to test your code</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Enter your input here..."
                className="font-mono h-32"
              />
            </CardContent>
          </Card>
        </div>

        <div>
          {runOutput && (
            <Card>
              <CardHeader>
                <CardTitle>Run Output</CardTitle>
                <CardDescription>
                  Time: {runOutput.time}s | Memory:{" "}
                  {Math.round(runOutput.memory / 1024)} MB
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-100 p-4 rounded-md">
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {runOutput.output}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="flex gap-4 mt-4">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit"
          )}
        </Button>
        <Button
          onClick={handleRun}
          variant="outline"
          disabled={isRunning}
          className="flex-1"
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            "Run"
          )}
        </Button>
      </div>
      {submissionResults && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Submission Results</CardTitle>
          </CardHeader>
          <CardContent>
            {submissionResults.map((result, index) => (
              <div key={index} className="mb-4 p-4 border rounded">
                <div className="font-semibold">Test Case {index + 1}</div>
                <div>Status: {result.status}</div>
                <div>Input: {result.input}</div>
                <div>Expected Output: {result.expectedOutput}</div>
                <div>
                  Actual Output: {result.actualOutput || "Processing..."}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      {submissionStatus && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Submission Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-lg font-semibold ${
                submissionStatus === "Accepted"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {submissionStatus}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CodingEnvironmentPage;
