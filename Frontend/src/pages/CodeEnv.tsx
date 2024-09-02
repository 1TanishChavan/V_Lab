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

const CodingEnvironmentPage = () => {
  const { courseId, practicalId } = useParams();
  const [courseName, setCourseName] = useState("");
  const [practicalName, setPracticalName] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [description, setDescription] = useState("");
  const [testCases, setTestCases] = useState([]);
  const [language, setLanguage] = useState("");
  const [languages, setLanguages] = useState([]);
  const [code, setCode] = useState("");
  const { user } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    const fetchPracticalDetails = async () => {
      try {
        const response = await api.get(`/practicals/${practicalId}`);
        const { course_name, practical_name, pdf_url, description, prac_io } =
          response.data;
        setCourseName(course_name);
        setPracticalName(practical_name);
        setPdfUrl(pdf_url);
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
        const fetchedLanguages = response.data || []; // Ensure it is an array

        setLanguages(fetchedLanguages);
        if (fetchedLanguages.length > 0) {
          setLanguage(
            fetchedLanguages[0].programming_language_id?.toString() || ""
          );
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch practical languages",
          variant: "destructive",
        });
      }
    };

    fetchPracticalDetails();
    fetchPracticalLanguages();
  }, [practicalId, toast]);

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
      const response = await api.post("/submissions", {
        practicalId,
        language,
        code,
        studentId: user.user_id,
      });

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Code submitted successfully",
        });
      } else {
        toast({
          title: "Submission Failed",
          description: response.data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit code",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{courseName}</h1>
      <h2 className="text-xl font-semibold mb-4">{practicalName}</h2>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{description}</p>
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              View PDF
            </a>
          )}
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
        <Select onValueChange={setLanguage} value={language}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Languages</SelectLabel>
              {languages.map((lang) => (
                <SelectItem
                  key={lang.programming_language_id}
                  value={lang.programming_language_id?.toString()}
                >
                  {lang.language_name || "Unknown Language"}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <Editor
        height="400px"
        language={
          languages.find(
            (lang) => lang.programming_language_id?.toString() === language
          )?.language_name || "javascript"
        }
        value={code}
        onChange={setCode}
        theme="vs-dark"
      />

      <Button onClick={handleSubmit} className="mt-4">
        Submit
      </Button>
    </div>
  );
};

export default CodingEnvironmentPage;
