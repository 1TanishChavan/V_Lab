import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "../components/hooks/use-toast";
import api from "../services/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useAuthStore } from "../store/authStore";
import { Loader2, Search } from "lucide-react";

const PracticalSubmissionPage = () => {
  const { practicalId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const user: any = useAuthStore((state) => state.user);

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingSubmissions, setIsFetchingSubmissions] = useState(false);
  const [allBatches, setAllBatches] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);

  // Details State
  const [practicalName, setPracticalName] = useState("");
  const [practicalSrNo, setPracticalSrNo] = useState("");
  const [courseSemester, setCourseSemester] = useState<number | null>(null);

  // Filter/Selection State
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [searchRollId, setSearchRollId] = useState("");

  // 1. Unified Initial Data Load
  useEffect(() => {
    const initPageData = async () => {
      setIsLoading(true);
      try {
        // Fetch Batches and Practical Details in parallel
        const [batchesRes, practicalRes] = await Promise.all([
          api.get(`/faculty/batches/${user.user_id}`),
          api.get(`/practicals/${practicalId}`),
        ]);

        setAllBatches(batchesRes.data);
        setPracticalName(practicalRes.data.practical_name);
        setPracticalSrNo(practicalRes.data.sr_no);

        // Fetch Course Semester if practical exists
        let currentSemester = null;
        if (practicalRes.data.course_id) {
          try {
            const courseRes = await api.get(
              `/courses/${practicalRes.data.course_id}`
            );
            // Handle array or object response from course API
            const courseData = Array.isArray(courseRes.data)
              ? courseRes.data[0]
              : courseRes.data;
            currentSemester = courseData.semester;
            setCourseSemester(currentSemester);
          } catch (err) {
            console.error("Failed to fetch course details");
          }
        }

        // Auto-select the first relevant batch
        const relevantBatches = currentSemester
          ? batchesRes.data.filter((b: any) => b.semester === currentSemester)
          : batchesRes.data;

        if (relevantBatches.length > 0) {
          setSelectedBatch(relevantBatches[0].batch_id.toString());
        }
      } catch (error) {
        console.error("Error initializing page:", error);
        toast({
          title: "Error",
          description: "Failed to load page data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.user_id && practicalId) {
      initPageData();
    }
  }, [user.user_id, practicalId]);

  // 2. Fetch Submissions when Batch Changes
  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!selectedBatch) return;

      setIsFetchingSubmissions(true);
      try {
        const response = await api.get(
          `/submissions/practical/${practicalId}?batchId=${selectedBatch}`
        );
        setSubmissions(response.data);
      } catch (error) {
        console.error("Error fetching submissions:", error);
        toast({
          title: "Error",
          description: "Failed to fetch submissions.",
          variant: "destructive",
        });
      } finally {
        setIsFetchingSubmissions(false);
      }
    };

    fetchSubmissions();
  }, [selectedBatch, practicalId]);

  // 3. Derived State (Memoized) - Replaces the 'filterSubmissions' effect
  const filteredBatches = useMemo(() => {
    if (courseSemester === null) return allBatches;
    return allBatches.filter((b) => b.semester === courseSemester);
  }, [allBatches, courseSemester]);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter(
      (submission) =>
        submission.roll_id.toLowerCase().includes(searchRollId.toLowerCase()) ||
        submission.student_name
          ?.toLowerCase()
          .includes(searchRollId.toLowerCase())
    );
  }, [submissions, searchRollId]);

  const handleViewSubmission = (submissionId: number) => {
    navigate(`/practical-submission-details/${practicalId}/${submissionId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Practical Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-medium">
                Practical {practicalSrNo}: {practicalName}
              </h3>
              {courseSemester && (
                <p className="text-sm text-muted-foreground">
                  Semester {courseSemester}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select a batch" />
                </SelectTrigger>
                <SelectContent>
                  {filteredBatches.length > 0 ? (
                    filteredBatches.map((batch: any) => (
                      <SelectItem
                        key={batch.batch_id}
                        value={batch.batch_id.toString()}
                      >
                        {batch.division} - {batch.batch_name}{" "}
                        {batch.semester !== courseSemester
                          ? `(Sem ${batch.semester})`
                          : ""}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No batches found
                    </div>
                  )}
                </SelectContent>
              </Select>

              <div className="relative w-[250px]">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by Roll ID or Name"
                  value={searchRollId}
                  onChange={(e) => setSearchRollId(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll ID</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submission Time</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isFetchingSubmissions ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex justify-center items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Fetching submissions...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredSubmissions.length > 0 ? (
                  filteredSubmissions.map((submission) => (
                    <TableRow key={submission.submission_id}>
                      <TableCell className="font-medium">
                        {submission.roll_id}
                      </TableCell>
                      <TableCell>{submission.student_name}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            submission.status === "Accepted"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {submission.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(submission.submission_time).toLocaleString()}
                      </TableCell>
                      <TableCell>{submission.marks}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() =>
                            handleViewSubmission(submission.submission_id)
                          }
                          variant="outline"
                        >
                          View
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
                      {selectedBatch
                        ? "No submissions found matching your criteria."
                        : "Please select a batch to view submissions."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PracticalSubmissionPage;
