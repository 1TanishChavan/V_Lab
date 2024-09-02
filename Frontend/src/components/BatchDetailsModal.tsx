import React, { useState, useEffect } from "react";
import { useCourseStore } from "../store/courseStore";
import Button from "./Button";

const BatchDetailsModal = ({ courseId, practical, onClose }) => {
  //   const { fetchBatchesForFaculty, updateBatchDetails } = useCourseStore();
  //   const [batches, setBatches] = useState([]);

  //   useEffect(() => {
  //     const loadBatches = async () => {
  //       const batchData = await fetchBatchesForFaculty(
  //         courseId,
  //         practical.practical_id
  //       );
  //       setBatches(batchData);
  //     };
  //     loadBatches();
  //   }, [courseId, practical, fetchBatchesForFaculty]);

  //   const handleUpdate = async (batchId, lockStatus, deadline) => {
  //     await updateBatchDetails(
  //       courseId,
  //       practical.practical_id,
  //       batchId,
  //       lockStatus,
  //       deadline
  //     );
  //     // Refresh batches or update local state
  //   };

  return (
    <div></div>
    //     <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
    //       <div className="bg-white p-4 rounded-lg max-w-lg w-full">
    //         <h3 className="text-lg font-bold mb-4">
    //           Batch Details for {practical.practical_name}
    //         </h3>
    //         {batches.map((batch) => (
    //           <div key={batch.id} className="mb-4">
    //             <h4>
    //               Division: {batch.division}, Batch: {batch.batch}
    //             </h4>
    //             <input
    //               type="checkbox"
    //               checked={batch.locked}
    //               onChange={(e) =>
    //                 handleUpdate(batch.id, e.target.checked, batch.deadline)
    //               }
    //             />{" "}
    //             Locked
    //             <input
    //               type="date"
    //               value={batch.deadline}
    //               onChange={(e) =>
    //                 handleUpdate(batch.id, batch.locked, e.target.value)
    //               }
    //             />
    //           </div>
    //         ))}
    //         <Button onClick={onClose}>Close</Button>
    //       </div>
    //     </div>
  );
};

export default BatchDetailsModal;
