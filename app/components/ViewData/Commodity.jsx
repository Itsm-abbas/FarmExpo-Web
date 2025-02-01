//components/ViewData/Commodity.jsx
import LinkButton from "@components/Button/LinkButton";
import ReusableTable from "@components/Table";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { MdEdit } from "react-icons/md";
import Swal from "sweetalert2";
const ViewCommodity = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editLoader, setEditLoader] = useState(false);
  const fetchCommodity = async () => {
    setIsLoading(true);
    const response = await fetch(`${apiUrl}/commodity`);
    const result = await response.json();
    setData(result);
    setIsLoading(false);
  };

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you really want to delete this commodity? This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        const response = await fetch(`${apiUrl}/commodity/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          console.log("id: " + id);
          console.log(response);
          throw new Error("Failed to delete commodity.");
        }
        Swal.fire({
          position: "top-center",
          icon: "success",
          title: "Deleted Successfully",
          showConfirmButton: false,
          timer: 1500,
        });
        await fetchCommodity();
      }
    } catch (error) {
      Swal.fire("Error!", error.message, "error");
    }
  };
  const handleEdit = async (id) => {
    router.push(`/consignment/commodity/add-commodity?id=${id}`);
  };
  useEffect(() => {
    fetchCommodity();
  }, []);
  const headers = ["s.no", "number", "name", "edit/delete"];
  return (
    <>
      <ReusableTable
        title="Commodity"
        headers={headers}
        data={data}
        isLoading={isLoading}
        onDelete={handleDelete}
        onEdit={handleEdit}
        addButton={
          <LinkButton
            title="Add Commodity"
            href="/consignment/commodity/add-commodity"
            icon={MdEdit}
            desc="Click to add new commodity"
          />
        }
      />
    </>
  );
};

export default ViewCommodity;
