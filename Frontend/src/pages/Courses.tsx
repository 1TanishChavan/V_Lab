import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCourseStore, Course } from "../store/courseStore";
import { useAuthStore } from "../store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { PlusIcon, Pencil, Trash2 } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";

const Courses: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [semester, setSemester] = useState("");
  const [currentSemester, setCurrentSemester] = useState<number | undefined>(1);
  const [refresh, setRefresh] = useState(false);
  const navigate = useNavigate();

  const courses = useCourseStore((state) => state.courses);
  const fetchCoursesByDepartment = useCourseStore(
    (state) => state.fetchCoursesByDepartment
  );
  const createCourse = useCourseStore((state) => state.createCourse);
  const updateCourse = useCourseStore((state) => state.updateCourse);
  const deleteCourse = useCourseStore((state) => state.deleteCourse);

  const user = useAuthStore((state) => state.user);
  const hodDepartmentId = user?.department_id;
  const isStudent = user?.role === "Student";

  useEffect(() => {
    if (hodDepartmentId) {
      fetchCoursesByDepartment(hodDepartmentId);
    }
  }, [fetchCoursesByDepartment, hodDepartmentId, refresh]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateCourse(editingId, {
        course_name: courseName,
        course_code: courseCode,
        department_id: hodDepartmentId,
        semester: parseInt(semester),
      });
    } else {
      await createCourse({
        course_name: courseName,
        course_code: courseCode,
        department_id: hodDepartmentId,
        semester: currentSemester,
      });
    }
    resetForm();
    setIsDrawerOpen(false);
    setRefresh(!refresh);
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

  const handleDelete = async (courseId: number) => {
    await deleteCourse(courseId);
    setRefresh(!refresh);
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

  return (
    <div className="container mx-auto mt-4">
      <Breadcrumb className="mb-4">
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/">
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>Courses</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-semibold">Semester {i + 1}</h3>
            {!isStudent && (
              <Button
                onClick={() => openAddDrawer(i + 1)}
                variant="outline"
                size="sm"
              >
                <PlusIcon className="mr-2 h-4 w-4" /> Add Course
              </Button>
            )}
          </div>
          <Carousel className="w-full">
            <CarouselContent>
              {courses
                .filter((course) => course.semester === i + 1)
                .map((course) => (
                  <CarouselItem
                    key={course.course_id}
                    className="md:basis-2/4 lg:basis-1/3"
                  >
                    <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                      <CardHeader>
                        <CardTitle
                          className="cursor-pointer hover:text-blue-600"
                          onClick={() => handleCourseClick(course.course_id)}
                        >
                          {course.course_name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Code: {course.course_code}
                        </p>
                      </CardContent>
                      {!isStudent && (
                        <CardFooter className="flex justify-between">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(course)}
                          >
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete the course.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(course.course_id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <Button variant="outline" size="sm" asChild>
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
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      ))}

      {!isStudent && (
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerContent>
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
              <DrawerFooter>
                <Button type="submit">
                  {editingId ? "Update" : "Create"} Course
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            </form>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
};

export default Courses;
