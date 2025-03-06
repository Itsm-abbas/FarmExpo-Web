//components/ViewData/packer.jsx
import LinkButton from "@components/Button/LinkButton";
import ReusableTable from "@components/Table";
import { fetchPackers } from "@constants/consignmentAPI";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@utils/axiosConfig";
import { useRouter } from "next/navigation";
import { MdEdit } from "react-icons/md";
import Swal from "sweetalert2";
const ViewPacker = () => {
  const router = useRouter();
  const { isLoading, data } = useQuery({
    queryKey: ["packers"],
    queryFn: fetchPackers,
  });

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
        const response = await axiosInstance.delete(`/packer/${id}`);
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
