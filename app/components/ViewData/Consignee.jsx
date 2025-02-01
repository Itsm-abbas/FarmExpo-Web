//components/ViewData/Consignee.jsx
import LinkButton from "@components/Button/LinkButton";
import DataLoader from "@components/Loader/dataLoader";
import fonts from "@utils/fonts";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { MdDelete, MdEdit } from "react-icons/md";
import Swal from "sweetalert2";
const ViewConsignee = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editLoader, setEditLoader] = useState(false);
  const fetchConsignee = async () => {
    setIsLoading(true);
    const response = await fetch(`${apiUrl}/consignee`);
    const result = await response.json();
    setData(result);
    setIsLoading(false);
  };

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you really want to delete this consignee? This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        const response = await fetch(`${apiUrl}/consignee/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Failed to delete Consignee.");
        }
        Swal.fire({
          position: "top-center",
          icon: "success",
          title: "Deleted Successfully",
          showConfirmButton: false,
          timer: 1500,
        });
        await fetchConsignee();
      }
    } catch (error) {
      Swal.fire("Error!", error.message, "error");
    }
  };
  const handleEdit = async (id) => {
    setEditLoader(true);
    router.push(`/consignment/consignee/add-consignee?id=${id}`);
    setEditLoader(false);
  };
  useEffect(() => {
    fetchConsignee();
  }, []);

  return (
    <div className="space-y-4">
      <div
        className={`${fonts.poppins.className}      border-2 border-LightBorder dark:border-DarkBorder shadow-md rounded-md p-3 md:p-6 text-LightPText  dark:text-DarkPText`}
      >
        <h2 className="text-xl font-semibold mb-4  ">All Consignee</h2>
        {isLoading && <DataLoader />}

        {!isLoading && (
          <table className=" table-auto text-sm md:text-base border-collapse border border-LightBorder dark:border-DarkBorder">
            <thead>
              <tr className="bg-PrimaryButton text-white ">
                <th className="border border-LightBorder dark:border-DarkBorder px-8 py-2">
                  S.No
                </th>
                <th className="border border-LightBorder dark:border-DarkBorder px-8 py-2">
                  Name
                </th>
                <th className="border border-LightBorder dark:border-DarkBorder px-8 py-2">
                  Address
                </th>
                <th className="border border-LightBorder dark:border-DarkBorder px-8 py-2">
                  Country
                </th>
                <th className="border border-LightBorder dark:border-DarkBorder px-8 py-2">
                  Edit/Delete
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Dynamically map data */}
              {data?.length > 0 ? (
                data?.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-LightBorder dark:border-DarkBorder px-8 py-2 text-center">
                      {index + 1}
                    </td>
                    <td className="border border-LightBorder dark:border-DarkBorder px-8 py-2 text-center">
                      {item?.name}
                    </td>
                    <td className="border border-LightBorder dark:border-DarkBorder px-8 py-2 text-center">
                      {item?.address}
                    </td>
                    <td className="border border-LightBorder dark:border-DarkBorder px-8 py-2 text-center">
                      {item?.country}
                    </td>
                    <td className="border border-LightBorder dark:border-DarkBorder px-8 py-2 text-center flex justify-center items-center">
                      <button
                        onClick={() => handleEdit(item?.id)}
                        className="text-blue-500 hover:underline text-xl"
                        disabled={editLoader}
                      >
                        {editLoader ? "Loading..." : <MdEdit />}
                      </button>
                      <span className="mx-2 font-bold">|</span>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-500 hover:underline text-xl"
                      >
                        <MdDelete />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="text-center">
                  <td colSpan="3">No Consignee found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      <LinkButton
        title="Add Consignee"
        href={"add-Consignee"}
        icon={MdEdit}
        desc="Click to add new Consignee"
      />
    </div>
  );
};

export default ViewConsignee;
