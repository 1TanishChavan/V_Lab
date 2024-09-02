import React, { useState, useEffect } from "react";
import { useDepartmentStore } from "../store/departmentStore";
import Button from "../components/Button";
import Input from "../components/Input";

const Department: React.FC = () => {
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const departments = useDepartmentStore((state) => state.departments);
  const fetchDepartments = useDepartmentStore(
    (state) => state.fetchDepartments
  );
  const createDepartment = useDepartmentStore(
    (state) => state.createDepartment
  );
  const updateDepartment = useDepartmentStore(
    (state) => state.updateDepartment
  );
  const deleteDepartment = useDepartmentStore(
    (state) => state.deleteDepartment
  );

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateDepartment(editingId, name);
      setEditingId(null);
    } else {
      await createDepartment(name);
    }
    setName("");
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">Manage Departments</h2>
      <form onSubmit={handleSubmit}>
        <Input
          label="Department Name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button type="submit">
          {editingId ? "Update" : "Create"} Department
        </Button>
      </form>
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Existing Departments</h3>
        <ul>
          {departments.map((department) => (
            <li
              key={department.department_id}
              className="flex justify-between items-center mb-2"
            >
              <span>{department.name}</span>
              <div>
                <Button
                  onClick={() => {
                    setName(department.name);
                    setEditingId(department.department_id);
                  }}
                >
                  Edit
                </Button>
                <Button
                  onClick={() => deleteDepartment(department.department_id)}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Department;
