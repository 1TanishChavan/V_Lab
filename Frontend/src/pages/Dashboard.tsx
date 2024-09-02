import React from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Button from "../components/Button";

const Dashboard: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">Welcome, {user?.username}!</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/course-creation">
          <Button className="w-full">Manage Courses</Button>
        </Link>
        <Link to="/practical-creation">
          <Button className="w-full">Manage Practicals</Button>
        </Link>
        <Link to="/assign-course">
          <Button className="w-full">Assign Courses</Button>
        </Link>
        <Link to="/practical-submission">
          <Button className="w-full">View Submissions</Button>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
