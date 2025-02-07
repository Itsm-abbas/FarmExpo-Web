"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import SaveButton from "@components/Button/SaveButton";
import Input from "@components/Input";
import UpdateConsignment from "@utils/updateConsignment";
import Link from "next/link";

const MySwal = withReactContent(Swal);
const Packing = ({
  consignmentId,
  existingData,
  setFormStatuses,
  setActiveAccordion,
}) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [ratePerKg, setRatePerKg] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedPacker, setSelectedPacker] = useState(null);
  const [packers, setPackers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (existingData) {
      setSelectedPacker(existingData.packer);
      setRatePerKg(existingData.ratePerKg);
    }
  }, [existingData]);

  const fetchPackers = async () => {
    try {
      const response = await fetch(`${apiUrl}/packer`);
      const data = await response.json();
      setPackers(data);
    } catch (error) {
      console.error("Error fetching packers:", error);
      setError("Failed to load packers.");
    }
  };

  useEffect(() => {
    fetchPackers();
  }, []);

  const handleSelectPacker = (packer) => {
    setSelectedPacker(packer);
    setShowDropdown(false);
  };

  const handleSubmit = async () => {
    if (!ratePerKg || selectedPacker === null) {
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "Please fill in all the fields.",
      });
      return;
    }

    setLoading(true);
    try {
      const payload = { packer: selectedPacker, ratePerKg };
      const url = existingData
        ? `${apiUrl}/packing/${existingData.id}`
        : `${apiUrl}/packing`;
      const method = existingData ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save data");
      }
      const { id } = await response.json();

      if (!existingData) {
        await UpdateConsignment(
          consignmentId,
          { packing: { id, ...payload } },
          "Pending"
        );
      }

      setFormStatuses((prev) => ({
        ...prev,
        packing: { id, ...payload },
      }));
      setActiveAccordion(null);
      MySwal.fire({
        icon: "success",
        title: "Success",
        text: "Packing data added successfully.",
      });

      setRatePerKg("");
      setSelectedPacker(null);
    } catch (error) {
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while saving data.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 text-LightPText dark:text-DarkPText w-full md:w-4/5 lg:w-1/2">
      <div className="shadow-md rounded-md p-6 space-y-4 border-LightBorder dark:border-DarkBorder border-2">
        <h2 className="text-xl font-semibold mb-4">Packing</h2>
        <div className="relative mb-4">
          <button
            className={`w-full p-2 rounded-md text-left border ${
              showDropdown
                ? "border-PrimaryButton"
                : "border-LightBorder dark:border-DarkBorder"
            }`}
            onClick={() => setShowDropdown((prev) => !prev)}
          >
            {selectedPacker ? selectedPacker.name : "Select Packer"}
          </button>
          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute bg-LightSBg dark:bg-DarkSBg shadow-md border mt-2 rounded-md z-10 max-h-60 overflow-y-auto w-full"
              >
                {loading ? (
                  <p className="p-4 text-gray-500">Loading...</p>
                ) : error ? (
                  <p className="p-4 text-red-500">{error}</p>
                ) : (
                  <>
                    {packers.map((packer, index) => (
                      <div
                        key={index}
                        className="p-2 hover:bg-LightPBg dark:hover:bg-DarkPBg cursor-pointer"
                        onClick={() => handleSelectPacker(packer)}
                      >
                        {packer.name}
                      </div>
                    ))}
                    <div className="p-2 text-PrimaryButton cursor-pointer hover:underline">
                      <Link href={"/consignment/packer/add-packer"}>
                        + Add New Packer
                      </Link>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <Input
          id="ratePerKg"
          label="Rate Per Kg"
          placeholder="Enter rate per kg"
          value={ratePerKg}
          onChange={(e) => setRatePerKg(e.target.value)}
        />
        <SaveButton
          handleSubmit={handleSubmit}
          isLoading={loading}
          existingData={existingData}
        />
      </div>
    </div>
  );
};

export default Packing;
