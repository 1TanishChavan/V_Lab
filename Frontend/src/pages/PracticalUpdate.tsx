import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCourseStore } from "../store/courseStore";
import { usePracticalStore } from "../store/practicalStore";
import api from "../services/api";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { MultiSelect } from "../components/multi-select";
import { useToast } from "../components/hooks/use-toast";
import { Loader2, Slash, Plus, Trash2 } from "lucide-react";

interface TestCase {
  input: string;
  output: string;
  isPublic: boolean;
}

const PracticalUpdate: React.FC = () => {
  const { practicalId, courseId } = useParams<{
    practicalId: string;
    courseId: string;
  }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Stores
  const { courses } = useCourseStore(); // We fetch course manually to ensure data exists
  const { updatePractical } = usePracticalStore();

  // Local State
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courseName, setCourseName] = useState("");

  // Form State
  const [srNo, setSrNo] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [programmingLanguages, setProgrammingLanguages] = useState<string[]>(
    []
  );
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [languageOptions, setLanguageOptions] = useState<
    { value: string; label: string }[]
  >([]);

  // Unified Data Loading
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Parallel Fetch: Course, Practical, Languages
        const [courseRes, practicalRes, langRes] = await Promise.all([
          api.get(`/courses/${courseId}`),
          api.get(`/practicals/${practicalId}`),
          api.get("/programming-languages"),
        ]);

        // 1. Set Course Name
        const courseData = Array.isArray(courseRes.data)
          ? courseRes.data[0]
          : courseRes.data;
        setCourseName(courseData?.course_name || "");

        // 2. Set Language Options
        setLanguageOptions(
          langRes.data.map((lang: any) => ({
            value: lang.programming_language_id.toString(),
            label: lang.language_name,
          }))
        );

        // 3. Populate Form with Practical Data
        const practical = practicalRes.data;
        setSrNo(practical.sr_no.toString());
        setTitle(practical.practical_name);
        setDescription(practical.description);
        setPdfUrl(practical.pdf_url || "");

        // Map Languages
        if (practical.prac_language) {
          setProgrammingLanguages(
            practical.prac_language.map((lang: any) =>
              lang.programming_language_id.toString()
            )
          );
        }

        // Map Test Cases
        if (practical.prac_io) {
          setTestCases(
            practical.prac_io.map((io: any) => ({
              input: io.input,
              output: io.output,
              isPublic: Boolean(io.isPublic), // Ensure boolean
            }))
          );
        } else {
          setTestCases([{ input: "", output: "", isPublic: false }]);
        }
      } catch (error) {
        console.error("Failed to load practical data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch practical details. Please refresh.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId && practicalId) {
      loadData();
    }
  }, [courseId, practicalId]);

  const handleTestCaseChange = (
    index: number,
    field: keyof TestCase,
    value: string | boolean
  ) => {
    const updatedTestCases = testCases.map((testCase, i) =>
      i === index ? { ...testCase, [field]: value } : testCase
    );
    setTestCases(updatedTestCases);
  };

  const addTestCase = () => {
    setTestCases([...testCases, { input: "", output: "", isPublic: false }]);
  };

  const removeTestCase = (index: number) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!srNo || !title) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePractical(parseInt(practicalId!), {
        sr_no: parseInt(srNo),
        practical_name: title,
        description,
        pdf_url: pdfUrl,
        course_id: parseInt(courseId!),
        prac_io: testCases,
        prac_language: programmingLanguages.map((lang) => ({
          programming_language_id: parseInt(lang),
        })),
      });

      toast({
        title: "Success",
        description: "Practical updated successfully!",
      });
      navigate(`/practicals/${courseId}`);
    } catch (error) {
      console.error("Failed to update practical:", error);
      toast({
        title: "Error",
        description: "Failed to update practical",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/courses">Courses</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <Slash />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/practicals/${courseId}`}>
              {courseName || "Course"}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <Slash />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink>Update Practical</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-3xl font-bold mb-6">Update Practical</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <label className="text-sm font-medium mb-1 block">Sr No</label>
                <Input
                  placeholder="Sr No"
                  type="number"
                  value={srNo}
                  onChange={(e) => setSrNo(e.target.value)}
                  required
                />
              </div>
              <div className="md:col-span-3">
                <label className="text-sm font-medium mb-1 block">Title</label>
                <Input
                  placeholder="Title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Description
              </label>
              <Textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="min-h-[100px]"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">PDF URL</label>
              <Input
                type="text"
                placeholder="PDF URL"
                value={pdfUrl}
                onChange={(e) => setPdfUrl(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Languages
              </label>
              <MultiSelect
                placeholder="Programming Languages"
                options={languageOptions}
                onValueChange={setProgrammingLanguages}
                defaultValue={programmingLanguages}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Test Cases</CardTitle>
            <Button
              type="button"
              onClick={addTestCase}
              variant="outline"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Test Case
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {testCases.map((testCase, index) => (
              <div
                key={index}
                className="relative p-4 border rounded-lg bg-card/50"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-medium uppercase text-muted-foreground mb-1 block">
                      Input
                    </label>
                    <Textarea
                      placeholder="Input"
                      value={testCase.input}
                      onChange={(e) =>
                        handleTestCaseChange(index, "input", e.target.value)
                      }
                      className="font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium uppercase text-muted-foreground mb-1 block">
                      Output
                    </label>
                    <Textarea
                      placeholder="Output"
                      value={testCase.output}
                      onChange={(e) =>
                        handleTestCaseChange(index, "output", e.target.value)
                      }
                      required
                      className="font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`public-${index}`}
                      checked={testCase.isPublic}
                      onCheckedChange={(checked) =>
                        handleTestCaseChange(
                          index,
                          "isPublic",
                          checked === true
                        )
                      }
                    />
                    <label
                      htmlFor={`public-${index}`}
                      className="text-sm font-medium leading-none"
                    >
                      Public test case
                    </label>
                  </div>
                  {testCases.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removeTestCase(index)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Remove
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Practical
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PracticalUpdate;
