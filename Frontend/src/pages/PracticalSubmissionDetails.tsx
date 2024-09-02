import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Editor } from "@monaco-editor/react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/hooks/use-toast";
import api from "../services/api";

const SubmissionDetailPage = () => {
  const { practicalId, submissionId } = useParams();
  const [submission, setSubmission] = useState(null);
  const [status, setStatus] = useState("");
  const [marks, setMarks] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const response = await api.get(`/submissions/${submissionId}`);
        setSubmission(response.data);
        setStatus(response.data.submission_status);
        setMarks(response.data.marks);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch submission details",
          variant: "destructive",
        });
      }
    };

    fetchSubmission();
  }, [submissionId, toast]);

  const handleUpdate = async () => {
    try {
      await api.put(`/submissions/${submissionId}`, { status, marks });
      toast({
        title: "Success",
        description: "Submission updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update submission",
        variant: "destructive",
      });
    }
  };

  if (!submission) return null;

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Practical Submission Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <strong>Practical SR No:</strong> {submission.practical_sr_no}
          </p>
          <p>
            <strong>Practical Name:</strong> {submission.practical_name}
          </p>
          <p>
            <strong>Course Name:</strong> {submission.course_name}
          </p>
          <p>
            <strong>Practical Language:</strong> {submission.prac_language}
          </p>
          <p>
            <strong>Input/Output Pairs:</strong>
          </p>
          <ul>
            {submission.prac_io.map((io, index) => (
              <li key={index}>
                <strong>Input:</strong> {io.input} <strong>Output:</strong>{" "}
                {io.output}
              </li>
            ))}
          </ul>
          <Editor
            height="400px"
            language={submission.prac_language.toLowerCase()}
            value={submission.code_submitted}
            theme="vs-dark"
            options={{ readOnly: true }}
          />
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Update Submission</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Accepted">Accepted</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mb-4">
            <Input
              type="number"
              value={marks}
              onChange={(e) => setMarks(parseInt(e.target.value))}
              placeholder="Marks"
            />
          </div>
          <Button onClick={handleUpdate}>Update Submission</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubmissionDetailPage;
