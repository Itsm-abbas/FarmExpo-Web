//components/ViewData/packaging.jsx
import LinkButton from "@components/Button/LinkButton";
import ReusableTable from "@components/Table";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { MdEdit } from "react-icons/md";
import Swal from "sweetalert2";
const ViewPackaging = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editLoader, setEditLoader] = useState(false);
  const fetchpackaging = async () => {
    setIsLoading(true);
    const response = await fetch(`${apiUrl}/packaging`);
    const result = await response.json();
    setData(result);
    setIsLoading(false);
  };

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you really want to delete this packaging? This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        const response = await fetch(`${apiUrl}/packaging/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          console.log(id);
          throw new Error("Failed to delete packaging.");
        }
        Swal.fire({
          position: "top-center",
          icon: "success",
          title: "Deleted Successfully",
          showConfirmButton: false,
          timer: 1500,
        });
        await fetchpackaging();
      }
    } catch (error) {
      Swal.fire("Error!", error.message, "error");
    }
  };
  const handleEdit = async (id) => {
    setEditLoader(true);
    router.push(`/consignment/packaging/add-packaging?id=${id}`);
    setEditLoader(false);
  };
  useEffect(() => {
    fetchpackaging();
  }, []);
  const headers = ["s.no", "name", "packagingWeightPerUnit", "edit/delete"];
  return (
    <>
      <ReusableTable
        title="packagings"
        headers={headers}
        data={data}
        isLoading={isLoading}
        onDelete={handleDelete}
        onEdit={handleEdit}
        addButton={
          <LinkButton
            title="Add packaging"
            href="/consignment/packaging/add-packaging"
            icon={MdEdit}
            desc="Click to add new packaging"
          />
        }
      />
    </>
  );
};

export default ViewPackaging;
