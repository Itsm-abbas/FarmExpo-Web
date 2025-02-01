//components/ViewData/packer.jsx
import LinkButton from "@components/Button/LinkButton";
import DataLoader from "@components/Loader/dataLoader";
import ReusableTable from "@components/Table";
import fonts from "@utils/fonts";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { MdDelete, MdEdit } from "react-icons/md";
import Swal from "sweetalert2";
const ViewPacker = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editLoader, setEditLoader] = useState(false);
  const fetchpacker = async () => {
    setIsLoading(true);
    const response = await fetch(`${apiUrl}/packer`);
    const result = await response.json();
    setData(result);
    setIsLoading(false);
  };

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you really want to delete this packer? This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        const response = await fetch(`${apiUrl}/packer/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Failed to delete packer.");
        }
        Swal.fire({
          position: "top-center",
          icon: "success",
          title: "Deleted Successfully",
          showConfirmButton: false,
          timer: 1500,
        });
        await fetchpacker();
      }
    } catch (error) {
      Swal.fire("Error!", error.message, "error");
    }
  };
  const handleEdit = async (id) => {
    setEditLoader(true);
    router.push(`/consignment/packer/add-packer?id=${id}`);
    setEditLoader(false);
  };
  useEffect(() => {
    fetchpacker();
  }, []);
  const headers = ["s.no", "name", "station", "edit/delete"];
  return (
    <>
      <ReusableTable
        title="Packers"
        headers={headers}
        data={data}
        isLoading={isLoading}
        onDelete={handleDelete}
        onEdit={handleEdit}
        addButton={
          <LinkButton
            title="Add Packer"
            href="/consignment/packer/add-packer"
            icon={MdEdit}
            desc="Click to add new packer"
          />
        }
      />
    </>
  );
};

export default ViewPacker;
