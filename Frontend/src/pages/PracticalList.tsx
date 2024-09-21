import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuthStore } from "../store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";
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
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { PlusIcon, Pencil, Trash2, Users, Lock } from "lucide-react";

const PracticalList = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [practicals, setPracticals] = useState([]);
  const [course, setCourse] = useState(null);
  const [batchAccess, setBatchAccess] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedPracticalId, setSelectedPracticalId] = useState(null);
  const user = useAuthStore((state) => state.user);
  const isStudent = user?.role === "Student";

  useEffect(() => {
    fetchPracticals();
    fetchCourse();
  }, [courseId]);

  const handlePracticalClick = (practical) => {
    // if (isStudent) {
    navigate(`/coding/${courseId}/${practical.practical_id}`);
    // } else {
    // navigate(`/practical-submission/${practical.practical_id}`);
    // }
  };

  const fetchPracticals = async () => {
    try {
      let response;
      if (isStudent) {
        // response = await api.get(`/practicals/course/${courseId}`);
        response = await api.get(`/practicals/${courseId}/student-view`);
      } else {
        response = await api.get(`/practicals/course/${courseId}`);
      }
      setPracticals(response.data);
    } catch (error) {
      console.error("Error fetching practicals:", error);
    }
  };

  const fetchCourse = async () => {
    try {
      const response = await api.get(`/courses/${courseId}`);
      setCourse(response.data);
    } catch (error) {
      console.error("Error fetching course:", error);
    }
  };

  const fetchBatchAccess = async (practicalId) => {
    try {
      const response = await api.get(`/batch-practical-access/${practicalId}`);
      setBatchAccess(response.data);
    } catch (error) {
      console.error("Error fetching batch access:", error);
    }
  };

  const handleAccessSubmit = async (batchId) => {
    try {
      const accessData = batchAccess.find(
        (access) => access.batch_id === batchId
      );
      if (accessData.lock == null) {
        accessData.lock = false;
      }
      await api.post("/batch-practical-access", {
        practical_id: selectedPracticalId,
        batch_id: batchId,
        lock: accessData.lock,
        deadline: accessData.deadline,
      });
      fetchBatchAccess(selectedPracticalId);
    } catch (error) {
      console.error("Error updating batch access:", error);
    }
  };

  const handleAccessClick = (practicalId) => {
    setSelectedPracticalId(practicalId);
    fetchBatchAccess(practicalId);
    setIsDrawerOpen(true);
  };

  // const handleAccessSubmit = async (batchId) => {
  //   try {
  //     const accessData = batchAccess.find(
  //       (access) => access.batch_id === batchId
  //     );
  //     if (accessData) {
  //       await api.put(
  //         `/batch-practical-access/${accessData.batch_practical_access_id}`,
  //         {
  //           lock: accessData.lock,
  //           deadline: accessData.deadline,
  //         }
  //       );
  //     } else {
  //       await api.post("/batch-practical-access", {
  //         practical_id: selectedPracticalId,
  //         batch_id: batchId,
  //         lock: false,
  //         deadline: new Date().toISOString(),
  //       });
  //     }
  //     fetchBatchAccess(selectedPracticalId);
  //   } catch (error) {
  //     console.error("Error updating batch access:", error);
  //   }
  // };

  const handleDelete = async (practicalId) => {
    try {
      await api.delete(`/practicals/${practicalId}`);
      fetchPracticals();
    } catch (error) {
      console.error("Error deleting practical:", error);
    }
  };

  const renderFacultyCard = (practical) => (
    <Card key={practical.practical_id} className="mb-4 w-full">
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <h3
            className="text-lg font-semibold truncate"
            onClick={() => handlePracticalClick(practical)}
          >
            {practical.sr_no}. {practical.practical_name}
          </h3>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigate(
                  `/practical-update/${courseId}/${practical.practical_id}`
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
                <Button variant="outline" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the practical.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(practical.practical_id)}
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

  const renderStudentCard = (practical) => {
    const isLocked = practical.lock;
    return (
      <Card
        key={practical.practical_id}
        className={`mb-4 w-full ${isLocked ? "opacity-30" : ""}`}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <h3
              className="text-lg font-semibold truncate"
              onClick={() => handlePracticalClick(practical)}
            >
              {practical.sr_no}. {practical.practical_name}
            </h3>
            <div>
              <span className="mr-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                Status: {practical.status || "Not Submitted"}
              </span>
              {practical.status === "Accepted" && (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  Marks: {practical.marks || 0}
                </span>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center">
            {/* <h3
              className="text-lg font-semibold truncate"
              onClick={() => handlePracticalClick(practical)}
            >
              {practical.sr_no}. {practical.practical_name}
            </h3> */}
            <p className="mt-2 text-sm text-gray-600">
              {practical.description}
            </p>
            <div>
              <p className="mt-2 text-sm text-gray-500">
                Deadline:
                {new Date(practical.deadline).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
        {/* <CardFooter className="flex justify-end ">
          <p className="text-sm text-gray-500">
            Deadline:
            {new Date(formatDate(practical.deadline)).toLocaleString()}
          </p>
        </CardFooter> */}
      </Card>
    );
  };

  return (
    <div className="container mx-auto mt-4 p-4">
      <Breadcrumb className="mb-4">
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/">
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/courses">
            Courses
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink>{course?.course_name}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <h1 className="text-3xl font-bold mb-6">
        {course?.course_name} Practicals
      </h1>

      {practicals.map((practical) =>
        isStudent ? renderStudentCard(practical) : renderFacultyCard(practical)
      )}

      {!isStudent && (
        <div className="fixed bottom-4 right-4">
          <Button onClick={() => navigate(`/practical-creation/${courseId}`)}>
            <PlusIcon className="mr-2 h-4 w-4" /> Add Practical
          </Button>
        </div>
      )}

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Batch Practical Access</DrawerTitle>
            <DrawerDescription>
              Manage access for different batches
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <div className="max-h-[60vh] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Division</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Lock</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batchAccess.map((access) => (
                    <TableRow key={access.batch_id}>
                      <TableCell>{access.division}</TableCell>
                      <TableCell>{access.batch_name}</TableCell>
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
                          value={new Date(access.deadline)
                            .toISOString()
                            .slice(0, 16)}
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
                          onClick={() => handleAccessSubmit(access.batch_id)}
                        >
                          Submit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <DrawerFooter>
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
