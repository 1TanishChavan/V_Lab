import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCourseStore, Course } from "../store/courseStore";
import { useAuthStore } from "../store/authStore";
import { useDepartmentStore } from "../store/departmentStore";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/ui/carousel";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb";
import {
  PlusIcon,
  Pencil,
  Trash2,
  ChevronDown,
  Slash,
  Loader2,
} from "lucide-react"; // Added Loader2
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { useToast } from "../components/hooks/use-toast"; // Added Toast

const Courses: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // UI Feedback state
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [semester, setSemester] = useState("");
  const [currentSemester, setCurrentSemester] = useState<number | undefined>(1);

  // Admin Selection State
  const [selectedDepartment, setSelectedDepartment] = useState<
    number | undefined
  >();

  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    courses,
    fetchCoursesByDepartment,
    createCourse,
    updateCourse,
    deleteCourse,
  } = useCourseStore();

  const { departments, fetchDepartments } = useDepartmentStore();
  const user = useAuthStore((state) => state.user);

  const isAdmin = user?.role === "Admin";
  const isHOD = user?.role === "HOD";
  const isStudent = user?.role === "Student";

  const canModifyCourses = isAdmin || isHOD;

  // Determine the active department ID based on role
  const currentDepartmentId = isAdmin
    ? selectedDepartment
    : user?.department_id;

  // 1. Fetch Departments (Admin only, only if empty)
  useEffect(() => {
    if (isAdmin && departments.length === 0) {
      fetchDepartments();
    }
  }, [isAdmin, fetchDepartments, departments.length]);

  // 2. Fetch Courses when Department ID changes
  useEffect(() => {
    if (currentDepartmentId) {
      fetchCoursesByDepartment(currentDepartmentId);
    }
  }, [fetchCoursesByDepartment, currentDepartmentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDepartmentId) {
      toast({
        title: "Error",
        description: "No department selected.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateCourse(editingId, {
          course_name: courseName,
          course_code: courseCode,
          department_id: currentDepartmentId,
          semester: parseInt(semester),
        });
        toast({
          title: "Updated",
          description: "Course updated successfully.",
        });
      } else {
        await createCourse({
          course_name: courseName,
          course_code: courseCode,
          department_id: currentDepartmentId,
          semester: currentSemester,
        });
        toast({
          title: "Created",
          description: "Course created successfully.",
        });
      }

      // Close & Reset
      resetForm();
      setIsDrawerOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save course.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (courseId: number) => {
    try {
      await deleteCourse(courseId);
      toast({ title: "Deleted", description: "Course deleted successfully." });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete course.",
        variant: "destructive",
      });
    }
  };

  const handleCourseClick = (courseId: number) => {
    navigate(`/practicals/${courseId}`);
  };

  const handleEdit = (course: Course) => {
    setEditingId(course.course_id);
    setCourseName(course.course_name);
    setCourseCode(course.course_code);
    setSemester(course.semester.toString());
    setIsDrawerOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setCourseName("");
    setCourseCode("");
    setSemester("");
  };

  const openAddDrawer = (semesterNum: number) => {
    setCurrentSemester(semesterNum);
    resetForm();
    setIsDrawerOpen(true);
  };

  const handleDepartmentChange = (departmentId: string) => {
    setSelectedDepartment(parseInt(departmentId));
  };

  // Filter courses locally for Students to only show their semester
  const filteredCourses = isStudent
    ? courses.filter((course) => course.semester === user?.semester) // Assuming user object has semester. If not, check logic.
    : courses;

  const visibleSemesters = isStudent
    ? user && "semester" in user
      ? [user.semester]
      : [] // Safe check if user might not have semester
    : Array.from({ length: 8 }, (_, i) => i + 1);

  return (
    <div className="container mx-auto mt-4 px-4">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <Slash />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            {isAdmin ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                  {departments.find(
                    (d) => d.department_id === selectedDepartment
                  )?.name || "Select Department"}
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {departments.map((dept) => (
                    <DropdownMenuItem
                      key={dept.department_id}
                      onClick={() =>
                        handleDepartmentChange(dept.department_id.toString())
                      }
                    >
                      {dept.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <span className="font-medium text-foreground">
                {
                  departments.find(
                    (d) => d.department_id === currentDepartmentId
                  )?.name
                }
              </span>
            )}
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {visibleSemesters.map((semNum) => (
        <div key={semNum} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">
              Semester {semNum}
            </h3>
            {canModifyCourses && (
              <Button
                onClick={() => openAddDrawer(semNum as number)}
                variant="outline"
                size="sm"
              >
                <PlusIcon className="mr-2 h-4 w-4" /> Add Course
              </Button>
            )}
          </div>

          {/* Carousel Container */}
          <Carousel className="w-full">
            <CarouselContent className="-ml-4">
              {filteredCourses
                .filter((course) => course.semester === semNum)
                .map((course) => (
                  <CarouselItem
                    key={course.course_id}
                    className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                  >
                    <Card className="h-full flex flex-col transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                      <CardHeader>
                        <CardTitle
                          className="cursor-pointer hover:text-blue-600 line-clamp-2"
                          onClick={() => handleCourseClick(course.course_id)}
                        >
                          {course.course_name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <p className="text-sm text-muted-foreground font-mono bg-muted p-1 rounded inline-block">
                          {course.course_code}
                        </p>
                      </CardContent>
                      {canModifyCourses && (
                        <CardFooter className="flex justify-between pt-0">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(course)}
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-500 hover:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete {course.course_name}?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete the course and all
                                    associated data.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-600 hover:bg-red-700"
                                    onClick={() =>
                                      handleDelete(course.course_id)
                                    }
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>

                          <Button variant="secondary" size="sm" asChild>
                            <Link to={`/course-assign/${course.course_id}`}>
                              Assign
                            </Link>
                          </Button>
                        </CardFooter>
                      )}
                    </Card>
                  </CarouselItem>
                ))}
            </CarouselContent>
            {/* Only show navigation if needed, usually handled by Carousel css but keeping components */}
            <CarouselPrevious className="left-0" />
            <CarouselNext className="right-0" />
          </Carousel>
        </div>
      ))}

      {canModifyCourses && (
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerContent>
            <div className="mx-auto w-full max-w-sm">
              <DrawerHeader>
                <DrawerTitle>
                  {editingId ? "Edit Course" : "Add Course"}
                </DrawerTitle>
                <DrawerDescription>
                  {editingId
                    ? "Update the course details below."
                    : "Enter the details for the new course."}
                </DrawerDescription>
              </DrawerHeader>
              <form onSubmit={handleSubmit} className="p-4">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="courseName" className="text-sm font-medium">
                      Course Name
                    </label>
                    <Input
                      id="courseName"
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="courseCode" className="text-sm font-medium">
                      Course Code
                    </label>
                    <Input
                      id="courseCode"
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                      required
                    />
                  </div>
                  {editingId && (
                    <div>
                      <label htmlFor="semester" className="text-sm font-medium">
                        Semester
                      </label>
                      <Select
                        onValueChange={(value) => setSemester(value)}
                        value={semester}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Semester" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 8 }, (_, i) => (
                            <SelectItem key={i} value={(i + 1).toString()}>
                              Semester {i + 1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <DrawerFooter className="px-0">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {editingId ? "Update" : "Create"} Course
                  </Button>
                  <DrawerClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DrawerClose>
                </DrawerFooter>
              </form>
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
};

export default Courses;
