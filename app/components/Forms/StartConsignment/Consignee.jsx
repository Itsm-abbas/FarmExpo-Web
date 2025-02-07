"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import SaveButton from "@components/Button/SaveButton";
import UpdateConsignment from "@utils/updateConsignment";

const MySwal = withReactContent(Swal);

export default function ConsigneeForm({
  consignmentId,
  existingData,
  setFormStatuses,
  setActiveAccordion,
}) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  const [consignee, setConsignee] = useState([]);
  const [selectedConsignee, setSelectedConsginee] = useState(null);
  const [isLaodingConsignee, setLoadingConsignee] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Fetch consignee from API
  useEffect(() => {
    const fetchConsignee = async () => {
      setLoadingConsignee(true);
      try {
        const response = await fetch(`${apiUrl}/consignee`);
        const result = await response.json();
        setConsignee(result);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch consignee.",
        });
      } finally {
        setLoadingConsignee(false);
      }
    };
    fetchConsignee();
  }, []);

  // Set existing data when editing
  useEffect(() => {
    if (existingData) {
      setSelectedConsginee(existingData);
    }
  }, [existingData]);

  // Handle consignee selection
  const handleConsigneeChange = (e) => {
    const selectedId = e.target.value;
    if (selectedId === "add-new-consignee") {
      router.push("/consignment/consignee/add-consignee");
    } else {
      const c = consignee.find((t) => t.id === parseInt(selectedId));
      setSelectedConsginee(c);
    }
    setIsDropdownOpen(false);
  };

  // Submit the selected consignee
  const handleSubmit = async () => {
    if (!selectedConsignee) {
      MySwal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please select a consignee.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedConsignment = await UpdateConsignment(
        consignmentId,
        { consignee: selectedConsignee },
        "Pending"
      );

      setFormStatuses((prev) => ({
        ...prev,
        consignee: selectedConsignee,
      }));
      setActiveAccordion(null);

      MySwal.fire({
        icon: "success",
        title: "Success",
        text: "Consignee updated successfully!",
      });
    } catch (error) {
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while updating the consignee.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="space-y-4 text-LightPText dark:text-DarkPText w-full md:w-4/5 lg:w-1/2 "
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="shadow-md rounded-md p-6 space-y-4 border-LightBorder dark:border-DarkBorder border-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-xl font-semibold mb-8">Select Consignee</h2>

        {/* Consignee Dropdown */}
        <div className="relative">
          {isLaodingConsignee ? (
            <p className="text-gray-500">Fetching consignee...</p>
          ) : (
            <div className="relative">
              <motion.select
                id="consignee"
                value={selectedConsignee?.id || ""}
                onChange={handleConsigneeChange}
                className="bg-LightPBg text-black dark:text-white mb-7 mt-1 block w-full border border-LightBorder dark:border-DarkBorder dark:bg-[#2d3748] rounded-md p-2 focus:ring-PrimaryButton focus:border-PrimaryButton dark:focus:ring-PrimaryButton dark:focus:border-PrimaryButton outline-none relative z-50"
              >
                <option value="">Select Consignee</option>
                {consignee.map((consignee) => (
                  <option key={consignee.id} value={consignee.id}>
                    {consignee.name}
                  </option>
                ))}
                <option
                  value="add-new-consignee"
                  className="text-green-600 font-semibold cursor-pointer"
                >
                  + Add New Consignee
                </option>
              </motion.select>
            </div>
          )}
        </div>

        {/* Save Button */}
        <SaveButton
          existingData={existingData}
          handleSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      </motion.div>
    </motion.div>
  );
}
