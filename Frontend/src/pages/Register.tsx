import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useDepartmentStore } from "../store/departmentStore";
import { useBatchStore } from "../store/batchStore";
import Input from "../components/Input";
import Button from "../components/Button";
import Dropdown from "../components/Dropdown";
import { Link } from "react-router-dom";

const Register: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"Student" | "Faculty" | "HOD">("Student");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [division, setDivision] = useState("");
  const [batch, setBatch] = useState("");
  const [rollId, setRollId] = useState("");
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);
  const departments = useDepartmentStore((state) => state.departments);
  const batches = useBatchStore((state) => state.batches);
  const fetchDepartments = useDepartmentStore(
    (state) => state.fetchDepartments
  );
  const fetchBatches = useBatchStore((state) => state.fetchBatches);

  useEffect(() => {
    fetchDepartments();
    fetchBatches();
  }, [fetchDepartments, fetchBatches]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userData = {
        username,
        email,
        password,
        role,
        department_id: department,
        ...(role === "Student" && {
          semester,
          division,
          batch_id: batch,
          roll_id: rollId,
        }),
      };
      await register(userData);
      navigate("/");
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  const departmentOptions = departments.map((dep) => ({
    value: dep.department_id.toString(),
    label: dep.name,
  }));

  const divisionOptions = batches
    .filter(
      (b) =>
        b.department_id.toString() === department &&
        b.semester.toString() === semester
    )
    .map((b) => ({ value: b.division.toString(), label: b.division }));

  const batchOptions = batches
    .filter(
      (b) =>
        b.department_id.toString() === department &&
        b.semester.toString() === semester &&
        b.division.toString() === division
    )
    .map((b) => ({ value: b.batch_id.toString(), label: b.batch }));

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <Input
            label="Username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            label="Email address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Role
            </label>
            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value as "Student" | "Faculty" | "HOD")
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="Student">Student</option>
              <option value="Faculty">Faculty</option>
              <option value="HOD">HOD</option>
            </select>
          </div>
          <Dropdown
            options={departmentOptions}
            onChange={(value) => setDepartment(value)}
            placeholder="Select Department"
            label="Department"
            id="department"
          />
          {role === "Student" && (
            <>
              <Input
                label="Roll ID"
                type="text"
                required
                value={rollId}
                onChange={(e) => setRollId(e.target.value)}
              />
              <Dropdown
                options={Array.from({ length: 8 }, (_, i) => ({
                  value: (i + 1).toString(),
                  label: `Semester ${i + 1}`,
                }))}
                onChange={(value) => setSemester(value)}
                placeholder="Select Semester"
                label="Semester"
                id="semester"
              />
              <Dropdown
                options={divisionOptions}
                onChange={(value) => setDivision(value)}
                placeholder="Select Division"
                label="Division"
                id="division"
              />
              <Dropdown
                options={batchOptions}
                onChange={(value) => setBatch(value)}
                placeholder="Select Batch"
                label="Batch"
                id="batch"
              />
            </>
          )}
          <Button type="submit" className="w-full">
            Register
          </Button>
        </form>
        <p>
          Already have an account? <Link to={`/login`}>Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
