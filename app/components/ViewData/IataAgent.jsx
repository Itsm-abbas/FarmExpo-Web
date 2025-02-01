//components/ViewData/iataagent.jsx
import LinkButton from "@components/Button/LinkButton";
import ReusableTable from "@components/Table";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { MdEdit } from "react-icons/md";
import Swal from "sweetalert2";
const ViewIataAgent = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editLoader, setEditLoader] = useState(false);
  const fetchIataAgent = async () => {
    setIsLoading(true);
    const response = await fetch(`${apiUrl}/iataagent`);
    const result = await response.json();
    setData(result);
    setIsLoading(false);
  };

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you really want to delete this iataagent? This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        const response = await fetch(`${apiUrl}/iataagent/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Failed to delete iataagent.");
        }
        Swal.fire({
          position: "top-center",
          icon: "success",
          title: "Deleted Successfully",
          showConfirmButton: false,
          timer: 1500,
        });
        await fetchIataAgent();
      }
    } catch (error) {
      Swal.fire("Error!", error.message, "error");
    }
  };
  const handleEdit = async (id) => {
    router.push(`/consignment/iata-agent/add-iataAgent?id=${id}`);
  };
  useEffect(() => {
    fetchIataAgent();
  }, []);
  const headers = ["s.no", "name", "station", "edit/delete"];
  return (
    <>
      <ReusableTable
        title="IATA Agents"
        headers={headers}
        data={data}
        isLoading={isLoading}
        onDelete={handleDelete}
        onEdit={handleEdit}
        addButton={
          <LinkButton
            title="Add iataagent"
            href="/consignment/iata-agent/add-iataAgent"
            icon={MdEdit}
            desc="Click to add new IATA agent"
          />
        }
      />
    </>
  );
};

export default ViewIataAgent;
