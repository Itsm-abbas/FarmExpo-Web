"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import DataLoader from "@components/Loader/dataLoader";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import Formatter from "@utils/dateFormat";
import fonts from "@utils/fonts";
import { MdDelete, MdEdit } from "react-icons/md";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [greeting, setGreeting] = useState("");
  const [loader, setLoader] = useState(false);
  const [editLoader, setEditLoader] = useState(false);
  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["repoData"],
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
          className={`${fonts.poppins.className} border-2 border-LightBorder dark:border-DarkBorder shadow-md rounded-md p-3 md:p-6 text-LightPText dark:text-DarkPText`}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-xl font-semibold mb-4  ">Your Consignments</h2>
          {isLoading && <DataLoader />}

          {!isLoading && (
            <motion.table
              className="capitalize table-auto text-sm md:text-base w-full border-collapse border border-LightBorder dark:border-DarkBorder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <thead>
                <tr className="bg-PrimaryButton text-white ">
                  <th className="border border-LightBorder dark:border-DarkBorder px-4 py-2">
                    No
                  </th>
                  <th className="border border-LightBorder dark:border-DarkBorder px-4 py-2">
                    Consignee
                  </th>
                  <th className="border border-LightBorder dark:border-DarkBorder px-4 py-2">
                    Status
                  </th>
                  <th className="border border-LightBorder dark:border-DarkBorder px-4 py-2">
                    Edit/Delete
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Dynamically map data */}
                {data?.length > 0 ? (
                  [...data]?.reverse().map((item, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.1 }}
                    >
                      <td className="border border-LightBorder dark:border-DarkBorder px-4 py-2 text-center">
                        {index + 1}
                      </td>
                      <td className="border border-LightBorder dark:border-DarkBorder px-4 py-2 text-center">
                        {item?.consignee?.name}
                      </td>
                      <td className="border border-LightBorder dark:border-DarkBorder px-4 py-2 text-center">
                        {item?.status || "N/A"}
                      </td>
                      <td className="border border-LightBorder dark:border-DarkBorder px-4 py-2 text-center flex justify-center items-center">
                        <button
                          onClick={() => handleEdit(item?.id)}
                          className="text-xl text-SecondaryButton"
                          disabled={editLoader}
                        >
                          {editLoader ? (
                            <span className="text-xs">Loading...</span>
                          ) : (
                            <MdEdit />
                          )}
                        </button>
                        <span className="mx-2 font-bold">|</span>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-500 hover:underline text-xl"
                        >
                          <MdDelete />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr className="text-center">
                    <td colSpan="3">No consignments found</td>
                  </tr>
                )}
              </tbody>
            </motion.table>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
