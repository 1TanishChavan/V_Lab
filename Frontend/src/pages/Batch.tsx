import React, { useState, useEffect } from "react";
import { useBatchStore } from "../store/batchStore";
import { useDepartmentStore } from "../store/departmentStore";
import Button from "../components/Button";
import Input from "../components/Input";
import Dropdown from "../components/Dropdown";

const Batch: React.FC = () => {
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [division, setDivision] = useState("");
  const [batch, setBatch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const batches = useBatchStore((state) => state.batches);
  const fetchBatches = useBatchStore((state) => state.fetchBatches);
  const createBatch = useBatchStore((state) => state.createBatch);
  const updateBatch = useBatchStore((state) => state.updateBatch);
  const deleteBatch = useBatchStore((state) => state.deleteBatch);
  const departments = useDepartmentStore((state) => state.departments);
  const fetchDepartments = useDepartmentStore(
    (state) => state.fetchDepartments
  );

  useEffect(() => {
    fetchBatches();
    fetchDepartments();
  }, [fetchBatches, fetchDepartments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateBatch(editingId, {
        department_id: parseInt(department),
        semester: parseInt(semester),
        division,
        batch,
      });
      setEditingId(null);
    } else {
      await createBatch({
        department_id: parseInt(department),
        semester: parseInt(semester),
        division,
        batch,
      });
    }
    setDepartment("");
    setSemester("");
    setDivision("");
    setBatch("");
  };

  const departmentOptions = departments.map((dep) => ({
    value: dep.department_id.toString(),
    label: dep.name,
  }));

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">Manage Batches</h2>
      <form onSubmit={handleSubmit}>
        <Dropdown
          options={departmentOptions}
          onChange={(value) => setDepartment(value)}
          placeholder="Select Department"
          label="Department"
          id="Department"
        />
        <Dropdown
          options={Array.from({ length: 8 }, (_, i) => ({
            value: (i + 1).toString(),
            label: `Semester ${i + 1}`,
          }))}
          onChange={(value) => setSemester(value)}
          placeholder="Select Semester"
          label="Semester"
          id="Semester"
        />
        <Input
          label="Division"
          type="text"
          required
          value={division}
          onChange={(e) => setDivision(e.target.value)}
        />
        <Input
          label="Batch"
          type="text"
          required
          value={batch}
          onChange={(e) => setBatch(e.target.value)}
        />
        <Button type="submit">{editingId ? "Update" : "Create"} Batch</Button>
      </form>
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Existing Batches</h3>
        <ul>
          {batches.map((batch) => (
            <li
              key={batch.batch_id}
              className="flex justify-between items-center mb-2"
            >
              <span>
                {batch.batch} - {batch.division} - Semester {batch.semester}
              </span>
              <div>
                <Button
                  onClick={() => {
                    setDepartment(batch.department_id.toString());
                    setSemester(batch.semester.toString());
                    setDivision(batch.division);
                    setBatch(batch.batch);
                    setEditingId(batch.batch_id);
                  }}
                >
                  Edit
                </Button>
                <Button onClick={() => deleteBatch(batch.batch_id)}>
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

export default Batch;
