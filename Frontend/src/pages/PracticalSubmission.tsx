import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/hooks/use-toast";
import api from "../services/api";

const PracticalSubmissionPage = () => {
  const { practicalId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await api.get(`/submissions/practical/${practicalId}`);
        setSubmissions(response.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch submissions",
          variant: "destructive",
        });
      }
    };

    fetchSubmissions();
  }, [practicalId, toast]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Practical Submissions</h1>
      {submissions.map((batch, index) => (
        <Card key={index} className="mb-4">
          <CardHeader>
            <CardTitle>{batch.batch_name}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll ID</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submission Time</TableHead>
                  <TableHead>Marks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batch.submissions.map((submission) => (
                  <TableRow key={submission.submission_id}>
                    <TableCell>{submission.roll_id}</TableCell>
                    <TableCell>{submission.student_name}</TableCell>
                    <TableCell>
                      <Link
                        to={`/practical-submission/${practicalId}/${submission.submission_id}`}
                      >
                        View Code
                      </Link>
                    </TableCell>
                    <TableCell>{submission.status}</TableCell>
                    <TableCell>
                      {new Date(submission.submission_time).toLocaleString()}
                    </TableCell>
                    <TableCell>{submission.marks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PracticalSubmissionPage;
