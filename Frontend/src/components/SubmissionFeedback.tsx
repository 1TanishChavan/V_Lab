import React from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"; // Assumes inside components folder
import { cn } from "@/lib/utils";

interface TestResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  status: string;
}

interface SubmissionFeedbackProps {
  submissionStatus: string | null;
  testResults: TestResult[];
}

const SubmissionFeedback: React.FC<SubmissionFeedbackProps> = ({
  submissionStatus,
  testResults,
}) => {
  // If nothing is happening, render nothing
  if (!submissionStatus && (!testResults || testResults.length === 0))
    return null;

  if (submissionStatus === "processing") {
    return (
      <div className="flex flex-col items-center justify-center p-6 space-y-3 bg-muted/30 rounded-lg border border-dashed animate-in fade-in">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-sm font-medium text-muted-foreground">
          Evaluating your code against test cases...
        </span>
      </div>
    );
  }

  if (!testResults || testResults.length === 0) return null;

  return (
    <div className="space-y-4 mt-6 animate-in slide-in-from-bottom-4 duration-500">
      <h3 className="text-lg font-semibold tracking-tight px-1">
        Test Case Results
      </h3>
      <div className="space-y-3">
        {testResults.map((result, index) => {
          const isAccepted = result.status === "Accepted";

          return (
            <Alert
              key={index}
              variant={isAccepted ? "default" : "destructive"}
              className={cn(
                "transition-all duration-200 border-l-4",
                isAccepted
                  ? "border-l-green-500 border-green-200 bg-green-50/50 dark:bg-green-900/10 dark:border-green-900"
                  : "border-l-red-500"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                {isAccepted ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="h-5 w-5" />
                )}
                <AlertTitle
                  className={cn(
                    "text-base",
                    isAccepted ? "text-green-800 dark:text-green-300" : ""
                  )}
                >
                  Test Case {index + 1}: {result.status}
                </AlertTitle>
              </div>

              <AlertDescription>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-sm">
                  {/* Input */}
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase text-muted-foreground">
                      Input
                    </span>
                    <div className="bg-background/80 p-2.5 rounded border font-mono text-xs overflow-x-auto whitespace-pre-wrap">
                      {result.input}
                    </div>
                  </div>

                  {/* Expected Output */}
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase text-muted-foreground">
                      Expected Output
                    </span>
                    <div className="bg-background/80 p-2.5 rounded border font-mono text-xs overflow-x-auto whitespace-pre-wrap">
                      {result.expectedOutput}
                    </div>
                  </div>

                  {/* Actual Output */}
                  <div className="md:col-span-2 space-y-1">
                    <span className="text-xs font-bold uppercase text-muted-foreground">
                      Your Output
                    </span>
                    <div
                      className={cn(
                        "p-2.5 rounded border font-mono text-xs overflow-x-auto whitespace-pre-wrap",
                        isAccepted
                          ? "bg-background/80"
                          : "bg-red-100/50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                      )}
                    >
                      {result.actualOutput || (
                        <span className="italic text-muted-foreground">
                          No output
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          );
        })}
      </div>
    </div>
  );
};

export default SubmissionFeedback;
