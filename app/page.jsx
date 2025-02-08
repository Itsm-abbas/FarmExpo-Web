"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import DataLoader from "@components/Loader/dataLoader";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import Formatter from "@utils/dateFormat";
import fonts from "@utils/fonts";
import { MdDelete, MdEdit, MdVisibility } from "react-icons/md";
import { motion } from "framer-motion";
import Loading from "./loading";
import LinkButton from "@components/Button/LinkButton";

export default function Home() {
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [greeting, setGreeting] = useState("");
  const [loader, setLoader] = useState(false);
  const [editLoader, setEditLoader] = useState(false);
  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["consignments"],
    queryFn: async () =>
      fetch(`${apiUrl}/consignment`).then((res) => res.json()),
  });

  if (error) return "An error has occurred: " + error.message;

  const startConsignment = async () => {
    const date = Formatter.format(new Date());
    setLoader(true);
    try {
      const response = await fetch(`${apiUrl}/consignment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: date,
          status: "Not started",
        }),
      });

      if (!response.ok) {
        setLoader(false);
        throw new Error("Failed to create consignment.");
      }

      const consignment = await response.json();
      router.push(`/items-selection/${consignment.id}`);
      setLoader(false);
      return consignment.id;
    } catch (error) {
      setLoader(false);
      throw error;
    }
  };

  const handleDelete = async (id) => {
    try {
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
        const response = await fetch(`${apiUrl}/consignment/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Failed to delete consignment.");
        }
        Swal.fire({
          position: "top-center",
          icon: "success",
          title: "Deleted!",
          showConfirmButton: false,
          timer: 1000,
        });
        refetch(); // Refresh the data after deletion
      }
    } catch (error) {
      console.error("Error deleting consignment:", error);
      Swal.fire("Error!", "Failed to delete the consignment.", "error");
    }
  };

  const handleEdit = async (id) => {
    setEditLoader(true);
    try {
      await router.push(`/startconsignment/${id}`); // Navigate
    } catch (error) {
      console.error("Navigation error:", error);
    } finally {
      setEditLoader(false); // Hide loader
    }
  };

  useEffect(() => {
    const getGreeting = () => {
      const currentHour = new Date().getHours();
      if (currentHour < 12 && currentHour > 4) {
        return "Good Morning";
      } else if (currentHour < 12 && currentHour > 16) {
        return "Good Afternoon";
      } else {
        return "Good Evening";
      }
    };

    setGreeting(getGreeting());
  }, []);
  useEffect(() => {
    if (editLoader) {
      <Loading />;
    }
  }, [editLoader]);
  return (
    <motion.div
      className="py-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col md:flex-row gap-24 md:gap-8 md:justify-between">
        {/* Left Section */}
        <motion.div
          className="flex flex-col justify-center items-start space-y-10"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {greeting && (
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold gap-2 ">
              <motion.span>{greeting}!</motion.span>{" "}
              <motion.span
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                Abbas
              </motion.span>
            </h1>
          )}
          <motion.button
            onClick={() => startConsignment()}
            className={`${fonts.poppins.className} text-sm sm:text-base flex gap-2 items-center px-4 sm:px-6 py-3 bg-PrimaryButton hover:bg-PrimaryButtonHover text-white rounded-lg transition`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loader}
          >
            {loader ? (
              <>
                <span>Creating Consignment...</span>
              </>
            ) : (
              "Start New Consignment"
            )}{" "}
            {!loader && <FaArrowRight />}
          </motion.button>
        </motion.div>

        {/* Right Section */}
        <motion.div
          className={`${fonts.poppins.className}  border-2 border-LightBorder dark:border-DarkBorder shadow-md rounded-md p-3 md:p-6 text-LightPText dark:text-DarkPText`}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-xl font-semibold mb-4">Your Consignments</h2>
          {isLoading && <DataLoader />}

          {!isLoading && (
            <motion.table
              className="w-full mb-4 min-w-max text-xs sm:text-sm md:text-base border-collapse border border-LightBorder dark:border-DarkBorder capitalize rounded-lg overflow-hidden shadow-md dark:shadow-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
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
                {data?.length > 0 ? (
                  [...data]
                    .reverse()
                    .filter((item) => item.status !== "Fulfilled") // Filter out "Fullfilled" consignments
                    .map((item, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.3 }}
                        className="hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                      >
                        <td className="border border-LightBorder dark:border-DarkBorder  sm:px-4 py-2 text-center">
                          {index + 1}
                        </td>
                        <td className="border border-LightBorder dark:border-DarkBorder  sm:px-4 py-2 text-center">
                          {item?.consignee?.name}
                        </td>
                        <td className="border border-LightBorder dark:border-DarkBorder  sm:px-4 py-2 text-center">
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
                        <td className="border border-LightBorder dark:border-DarkBorder  sm:px-4 py-2 text-cente">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleEdit(item?.id)}
                              className="p-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition text-lg"
                              disabled={editLoader}
                            >
                              <MdEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition text-lg"
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
            </motion.table>
          )}
          <LinkButton
            title={"Show All"}
            desc="Click to show all consignments"
            href={"consignment/all-consignments"}
            icon={MdVisibility}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
