import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DataLoader from "@components/Loader/dataLoader";
import { useState } from "react";
import Formatter from "@utils/dateFormat";
import fonts from "@utils/fonts";
import { MdDelete, MdEdit } from "react-icons/md";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import axios from "axios";

export default function AllConsignments() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [filters, setFilters] = useState({
    date: "",
    status: "",
    search: "",
  });

  const { isLoading, error, data } = useQuery({
    queryKey: ["consignments"],
    queryFn: async () => {
      const response = await axios.get(`${apiUrl}/consignment`);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  if (error) return "An error has occurred: " + error.message;

  const filteredData = data?.filter((item) => {
    const matchesDate = filters.date
      ? Formatter.format(new Date(item.date)) ===
        Formatter.format(new Date(filters.date))
      : true;
    const matchesStatus = filters.status
      ? item.status === filters.status
      : true;
    const matchesSearch = filters.search
      ? item.consignee?.name
          .toLowerCase()
          .includes(filters.search.toLowerCase())
      : true;
    return matchesDate && matchesStatus && matchesSearch;
  });

  const deleteConsignmentMutation = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`${apiUrl}/consignment/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["consignments"]);
      Swal.fire({
        position: "top-center",
        icon: "success",
        title: "Deleted!",
        showConfirmButton: false,
        timer: 1000,
      });
    },
    onError: (error) => {
      Swal.fire("Error!", error.message, "error");
    },
  });

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this consignment? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      deleteConsignmentMutation.mutate(id);
    }
  };

  return (
    <motion.div
      className={`py-6 ${fonts.lato.className}  w-full sm:w-auto sm:px-6 lg:px-8`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col gap-8">
        <h1 className="text-2xl sm:text-3xl font-bold">All Consignments</h1>

        {/* Filter Section */}
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            className="p-2 border rounded dark:bg-DarkSBg dark:border-DarkBorder focus-within:outline-none flex-1"
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="p-2 border rounded dark:bg-DarkSBg dark:border-DarkBorder focus-within:outline-none flex-1"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Fulfilled">Fulfilled</option>
          </select>
          <input
            type="text"
            placeholder="Search by consignee"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="p-2 border rounded dark:bg-DarkSBg dark:border-DarkBorder focus-within:outline-none flex-1"
          />
        </div>

        {/* Table Section */}
        {isLoading && <DataLoader />}
        {!isLoading && (
          <motion.div
            className="overflow-x-auto shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <table className="w-full min-w-max text-xs sm:text-sm md:text-base border-collapse border border-LightBorder dark:border-DarkBorder capitalize rounded-lg overflow-hidden ">
              <thead>
                <tr className="bg-PrimaryButton text-white">
                  {["No", "Consignee", "Status", "Actions"].map(
                    (item, index) => (
                      <th
                        key={index}
                        className="px-3 sm:px-6 md:px-8 py-2 border border-LightBorder dark:border-DarkBorder text-center"
                      >
                        {item}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredData?.length > 0 ? (
                  filteredData.map((item, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.2 }}
                      className="hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                      <td className="border border-LightBorder dark:border-DarkBorder sm:px-4 py-1 sm:py-2 text-center">
                        {index + 1}
                      </td>
                      <td className="border border-LightBorder dark:border-DarkBorder sm:px-4 py-1 sm:py-2 text-center">
                        {item?.consignee?.name}
                      </td>
                      <td className="border border-LightBorder dark:border-DarkBorder sm:px-4 py-1 sm:py-2 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            item?.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : item?.status === "Fulfilled"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {item?.status || "N/A"}
                        </span>
                      </td>
                      <td className="border border-LightBorder dark:border-DarkBorder sm:px-4 py-1 sm:py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() =>
                              router.push(`/startconsignment/${item?.id}`)
                            }
                            className="p-1 sm:p-2 rounded-md bg-SecondaryButton text-white hover:bg-SecondaryButtonHover transition text-base sm:text-lg"
                          >
                            <MdEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1 sm:p-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition text-base sm:text-lg"
                          >
                            <MdDelete />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr className="text-center">
                    <td colSpan="4" className="py-4 text-gray-500">
                      No consignments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
