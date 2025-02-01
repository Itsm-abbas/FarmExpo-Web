"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import SaveButton from "@components/Button/SaveButton";

const MySwal = withReactContent(Swal);

export default function TraderForm({
  consignmentId,
  existingData,
  setFormStatuses,
  setActiveAccordion,
}) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  const [traders, setTraders] = useState([]);
  const [selectedTrader, setSelectedTrader] = useState(null);
  const [isLoadingTraders, setIsLoadingTraders] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch traders from API
  useEffect(() => {
    const fetchTraders = async () => {
      setIsLoadingTraders(true);
      try {
        const response = await fetch(`${apiUrl}/trader`);
        const result = await response.json();
        setTraders(result);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch traders.",
        });
      } finally {
        setIsLoadingTraders(false);
      }
    };
    fetchTraders();
  }, []);

  // Set existing data when editing
  useEffect(() => {
    if (existingData) {
      setSelectedTrader(existingData);
    }
  }, [existingData]);

  // Handle trader selection
  const handleTraderChange = (e) => {
    const selectedId = e.target.value;
    if (selectedId === "add-new-trader") {
      router.push("/consignment/trader/add-trader");
    } else {
      const trader = traders.find((t) => t.id === parseInt(selectedId));
      setSelectedTrader(trader);
    }
  };

  // Submit the selected trader
  const handleSubmit = async () => {
    if (!selectedTrader) {
      MySwal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please select a trader.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiUrl}/consignment/${consignmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trader: selectedTrader }),
      });

      if (!response.ok) {
        throw new Error("Failed to update consignment.");
      }

      setFormStatuses((prev) => ({
        ...prev,
        trader: selectedTrader,
      }));
      setActiveAccordion(null);

      MySwal.fire({
        icon: "success",
        title: "Success",
        text: "Trader updated successfully!",
      });
    } catch (error) {
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while updating the trader.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="space-y-4 text-LightPText dark:text-DarkPText w-full md:w-4/5 lg:w-1/2"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="shadow-md rounded-md p-6 space-y-4 border-LightBorder dark:border-DarkBorder border-2"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-xl font-semibold mb-8">Select Trader</h2>

        {/* Trader Dropdown */}
        <div>
          {isLoadingTraders ? (
            <p className="text-gray-500">Fetching traders...</p>
          ) : (
            <motion.select
              id="trader"
              value={selectedTrader?.id || ""}
              onChange={handleTraderChange}
              className="bg-LightPBg text-black dark:text-white mb-7 mt-1 block w-full border border-LightBorder dark:border-DarkBorder dark:bg-[#2d3748] rounded-md p-2 focus:ring-PrimaryButton focus:border-PrimaryButton dark:focus:ring-PrimaryButton dark:focus:border-PrimaryButton outline-none"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <option value="">Select Trader</option>
              {traders.map((trader) => (
                <option key={trader.id} value={trader.id}>
                  {trader.name}
                </option>
              ))}
              <option
                value="add-new-trader"
                className="text-green-600 font-semibold cursor-pointer"
              >
                + Add New Trader
              </option>
            </motion.select>
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
