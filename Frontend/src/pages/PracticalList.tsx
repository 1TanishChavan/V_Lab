import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuthStore } from "../store/authStore";
import { usePracticalStore } from "../store/practicalStore"; // Added store
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Switch } from "../components/ui/switch";
import {
  Slash,
  Loader2,
  PlusIcon,
  Pencil,
  Trash2,
  Users,
  Lock,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "../components/ui/breadcrumb";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "../components/ui/drawer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { Input } from "../components/ui/input";
import { useToast } from "../components/hooks/use-toast";

const PracticalList = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Stores & User
  const user = useAuthStore((state) => state.user);
  const { deletePractical } = usePracticalStore(); // Use store action
  const isStudent = user?.role === "Student";

  // State
  const [practicals, setPracticals] = useState<any[]>([]);
  const [course, setCourse] = useState<any>(null);
  const [batchAccess, setBatchAccess] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Page loading state

  // Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedPracticalId, setSelectedPracticalId] = useState<number | null>(
    null
  );

  // Unified Fetching
  useEffect(() => {
    const loadPageData = async () => {
      setIsLoading(true);
      try {
        // Determine practicals endpoint based on role
        const practicalsEndpoint = isStudent
          ? `/practicals/${courseId}/student-view`
          : `/practicals/course/${courseId}`;

        const [courseRes, practicalsRes] = await Promise.all([
          api.get(`/courses/${courseId}`),
          api.get(practicalsEndpoint),
        ]);

        // Set Course (API usually returns array for getById, handling that)
        setCourse(
          Array.isArray(courseRes.data) ? courseRes.data[0] : courseRes.data
        );

        // Set Practicals
        const sortedPracticals = practicalsRes.data.sort(
          (a: any, b: any) => a.sr_no - b.sr_no
        );
        setPracticals(sortedPracticals);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load course data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      loadPageData();
    }
  }, [courseId, isStudent]);

  const handlePracticalClick = (practical: any) => {
    navigate(`/coding/${courseId}/${practical.practical_id}`);
  };

  // Access Management Logic
  const fetchBatchAccess = async (practicalId: number) => {
    try {
      const response = await api.get(
        `/batch-practical-access/${practicalId}/${courseId}/${user?.user_id}`
      );
      const batchesWithDefaults = response.data.map((batch: any) => ({
        ...batch,
        lock: batch.lock === null ? true : batch.lock,
        deadline: batch.deadline || new Date().toISOString().slice(0, 16),
      }));
      setBatchAccess(batchesWithDefaults);
    } catch (error) {
      console.error("Error fetching batch access:", error);
      toast({
        title: "Error",
        description: "Failed to fetch access settings",
        variant: "destructive",
      });
    }
  };

  const handleAccessClick = (practicalId: number) => {
    setSelectedPracticalId(practicalId);
    fetchBatchAccess(practicalId);
    setIsDrawerOpen(true);
  };

  const handleAccessSubmit = async (batchId: number) => {
    try {
      const accessData = batchAccess.find(
        (access) => access.batch_id === batchId
      );

      if (!accessData) return;

      // Optimistic check
      const payloadLock = accessData.lock == null ? false : accessData.lock;

      await api.post("/batch-practical-access", {
        practical_id: selectedPracticalId,
        batch_id: batchId,
        lock: payloadLock,
        deadline:
          accessData.deadline === "Not set" ? null : accessData.deadline,
      });

      toast({ title: "Success", description: "Access settings updated." });
      // Refresh access data to confirm
      if (selectedPracticalId) await fetchBatchAccess(selectedPracticalId);
    } catch (error) {
      console.error("Error updating batch access:", error);
      toast({
        title: "Error",
        description: "Failed to update access.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (practicalId: number) => {
    try {
      // Use Store Action for side effects if needed, or direct API if store isn't keeping this list
      await deletePractical(practicalId); // Assuming store action calls API

      // Optimistic Update: Remove from local state immediately
      setPracticals((prev) =>
        prev.filter((p) => p.practical_id !== practicalId)
      );

      toast({
        title: "Deleted",
        description: "Practical deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting practical:", error);
      toast({
        title: "Error",
        description: "Failed to delete practical.",
        variant: "destructive",
      });
    }
  };

  // --- Render Helpers ---

  const renderFacultyCard = (practical: any) => (
    <Card
      key={practical.practical_id}
      className="mb-4 w-full transform hover:scale-[1.01] transition-all duration-200 shadow-sm hover:shadow-md"
    >
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3
            className="text-lg font-semibold truncate cursor-pointer hover:text-primary"
            onClick={() => handlePracticalClick(practical)}
          >
            {practical.sr_no}. {practical.practical_name}
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigate(
                  `/practicals/${courseId}/${practical.practical_id}/edit`
                )
              }
            >
              <Pencil className="mr-2 h-4 w-4" /> Update
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigate(
                  `/practical-submission/${courseId}/${practical.practical_id}`
                )
              }
            >
              <Users className="mr-2 h-4 w-4" /> Submissions
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAccessClick(practical.practical_id)}
            >
              <Lock className="mr-2 h-4 w-4" /> Access
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Practical?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the practical <strong>{practical.practical_name}</strong>.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(practical.practical_id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStudentCard = (practical: any) => {
    const isLocked = practical.lock;
    const hasPassedDeadline = new Date(practical.deadline) < new Date();
    const isPastDeadlineUnsuccessful =
      hasPassedDeadline && practical.status !== "Accepted";

    if (isLocked) return null;

    return (
      <Card
        key={practical.practical_id}
        className={`mb-4 w-full transform hover:scale-[1.01] transition-all duration-200 shadow-sm hover:shadow-md border-l-4 ${
          practical.status === "Accepted"
            ? "border-l-green-500"
            : isPastDeadlineUnsuccessful
            ? "border-l-red-500"
            : "border-l-blue-500"
        }`}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h3
              className="text-lg font-semibold truncate cursor-pointer hover:text-primary"
              onClick={() => handlePracticalClick(practical)}
            >
              {practical.sr_no}. {practical.practical_name}
            </h3>
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  practical.status === "Accepted"
                    ? "bg-green-100 text-green-800"
                    : isPastDeadlineUnsuccessful
                    ? "bg-red-100 text-red-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {practical.status || "Pending"}
              </span>
              {practical.status === "Accepted" && (
                <span className="px-2.5 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  {practical.marks || 0} Marks
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-between items-end">
            <p className="text-sm text-muted-foreground line-clamp-2 max-w-[70%]">
              {practical.description}
            </p>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Deadline</p>
              <p
                className={`text-sm font-medium ${
                  hasPassedDeadline ? "text-red-600" : ""
                }`}
              >
                {new Date(practical.deadline).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // --- Main Render ---

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading Practicals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-4 p-4">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <Slash />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            {/* Fallback safely if department_id/name is missing */}
            <BreadcrumbLink href={`/departments/${course?.department_id}`}>
              {course?.department_name || "Department"}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <Slash />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink
              href={`/departments/${course?.department_id}/semester/${course?.semester}`}
            >
              Semester {course?.semester}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <Slash />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>{course?.course_name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {course?.course_name} Practicals
        </h1>
        {!isStudent && (
          <Button onClick={() => navigate(`/practical-creation/${courseId}`)}>
            <PlusIcon className="mr-2 h-4 w-4" /> Add Practical
          </Button>
        )}
      </div>

      {practicals.length > 0 ? (
        <div className="space-y-4">
          {practicals.map((practical) =>
            isStudent
              ? renderStudentCard(practical)
              : renderFacultyCard(practical)
          )}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">
            No practicals found for this course.
          </p>
        </div>
      )}

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Batch Practical Access</DrawerTitle>
            <DrawerDescription>
              Manage access settings for different batches.
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <div className="max-h-[60vh] overflow-y-auto border rounded-md">
              {batchAccess.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Batch</TableHead>
                      <TableHead>Lock</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batchAccess.map((access) => (
                      <TableRow key={access.batch_id}>
                        <TableCell>
                          <div className="font-medium">
                            {access.division} - {access.batch_name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={access.lock}
                            onCheckedChange={(checked) => {
                              setBatchAccess(
                                batchAccess.map((a) =>
                                  a.batch_id === access.batch_id
                                    ? { ...a, lock: checked }
                                    : a
                                )
                              );
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="datetime-local"
                            className="w-[220px]"
                            value={
                              access.deadline && access.deadline !== "Not set"
                                ? new Date(access.deadline)
                                    .toISOString()
                                    .slice(0, 16) // Fixed slice for datetime-local compatibility
                                : ""
                            }
                            onChange={(e) => {
                              setBatchAccess(
                                batchAccess.map((a) =>
                                  a.batch_id === access.batch_id
                                    ? { ...a, deadline: e.target.value }
                                    : a
                                )
                              );
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleAccessSubmit(access.batch_id)}
                          >
                            Save
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No batches assigned for this course.
                </div>
              )}
            </div>
          </div>
          <DrawerFooter className="pt-2">
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default PracticalList;
