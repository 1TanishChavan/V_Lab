import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { useThemeStore } from "./store/themeStore";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CourseCreation from "./pages/CourseCreation";
import CourseUpdate from "./pages/CourseUpdate";
import Courses from "./pages/Courses";
import CourseAssign from "./pages/CourseAssign";
import PracticalCreation from "./pages/PracticalCreation";
import PracticalUpdate from "./pages/PracticalUpdate";
import PracticalSubmission from "./pages/PracticalSubmission";
import PracticalList from "./pages/PracticalList";
import Dashboard from "./pages/Dashboard";
import Batch from "./pages/Batch";
import AuthTabs from "./pages/AuthTabs";
import CodingEnvironmentPage from "./pages/CodeEnv";
import PracticalSubmissionDetails from "./pages/PracticalSubmissionDetails";

const App: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <div className={`flex flex-col min-h-screen ${isDarkMode ? "dark" : ""}`}>
      <Router>
        <Layout>
          <div className="flex-grow">
            <Routes>
              <Route
                path="/"
                element={isAuthenticated ? <Dashboard /> : <AuthTabs />}
              />
              {/* <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} /> */}
              <Route path="/login" element={<AuthTabs />} />
              <Route path="/register" element={<AuthTabs />} />
              <Route path="/courses" element={<Courses />} />
              <Route
                path="/course-assign/:courseId"
                element={<CourseAssign />}
              />
              <Route path="/practicals/:courseId" element={<PracticalList />} />
              <Route
                path="/practical-creation/:courseId"
                element={<PracticalCreation />}
              />
              <Route
                path="/practical-update/:courseId/:practicalId"
                element={<PracticalUpdate />}
              />
              <Route
                path="/practical-submission/:courseId/:practicalId"
                element={<PracticalSubmission />}
              />
              <Route
                path="/practical-submission/:practicalId/:submissionId"
                element={<PracticalSubmissionDetails />}
              />
              <Route
                path="/coding/:courseId/:practicalId"
                element={<CodingEnvironmentPage />}
              />
              <Route path="/batches" element={<PracticalList />} />
              <Route path="/dashboard" element={<Batch />} />
            </Routes>
          </div>
        </Layout>
      </Router>
    </div>
  );
};

export default App;
