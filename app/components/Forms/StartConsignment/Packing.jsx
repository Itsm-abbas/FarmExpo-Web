"use client";
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import SaveButton from "@components/Button/SaveButton";
import Input from "@components/Input";
import UpdateConsignment from "@utils/updateConsignment";

const MySwal = withReactContent(Swal);
const Packing = ({ consignmentId, existingData, setFormStatuses }) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [ratePerKg, setRatePerKg] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedPacker, setSelectedPacker] = useState(null); // Selected packer
  const [packers, setPackers] = useState([]); // packer fetched from API
  const [showDropdown, setShowDropdown] = useState(false); // Toggle dropdown visibility
  const [error, setError] = useState(null); // Error state for API call

  // Handle selecting a packer agent
  const handleSelectPacker = (packer) => {
    setSelectedPacker(packer);
    setShowDropdown(false); // Close dropdown
  };
  useEffect(() => {
    if (existingData) {
      setSelectedPacker(existingData.packer); // Pre-fill the form with existing data
      setRatePerKg(existingData.ratePerKg); // Pre-fill the form with existing data
    }
  }, [existingData]);

  const handleSubmit = async () => {
    if (!ratePerKg || selectedPacker === null) {
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "Please fill in all the fields.",
      });
      return;
    }
    if (existingData) {
      if (
        formData.ntn === existingData.ntn &&
        formData.name === existingData.name &&
        formData.address === existingData.address &&
        formData.country === existingData.country
      ) {
        MySwal.fire({
          icon: "error",
          title: "Same data",
          text: "Please make changes to update the data.",
        });
        return;
      } // Check if there are changes in existing data - if not, return
    }
    setLoading(true);
    try {
      const payload = {
        packer: selectedPacker, // Pass the full selected agent
        ratePerKg,
      };
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

      if (existingData) {
        await UpdateConsignment(consignmentId, { packing: { id, ...payload } });
      } else {
        await UpdateConsignment(
          consignmentId,
          { packing: { id, ...payload } },
          "Packing"
        );
      }
      setFormStatuses((prev) => ({
        ...prev,
        packing: { id, ...payload },
      }));
      MySwal.fire({
        icon: "success",
        title: "Success",
        text: "Packing data added successfully.",
      });

      // Clear input fields
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
  useEffect(() => {
    const fetchPackers = async () => {
      try {
        const response = await fetch(`${apiUrl}/packer`);
        const data = await response.json();
        setPackers(data); // Assuming data is an array of packer
      } catch (error) {
        console.error("Error fetching packers:", error);
        setError("Failed to load packers.");
      }
    };

    fetchPackers();
  }, []);
  return (
    <div className="space-y-4 text-LightPText dark:text-DarkPText w-full md:w-4/5 lg:w-1/2">
      <div className=" shadow-md rounded-md p-6 space-y-4 border-LightBorder dark:border-DarkBorder border-2">
        <h2 className="text-xl font-semibold mb-4">Packing</h2>
        {/* Packers Dropdown */}
        <div className="relative mb-4">
          <button
            className={`${
              showDropdown
                ? "border border-PrimaryButton"
                : "border border-LightBorder dark:border-DarkBorder"
            } w-full  p-2 rounded-md text-left`}
            onClick={() => setShowDropdown((prev) => !prev)}
          >
            {selectedPacker ? selectedPacker.name : "Select Packer"}
          </button>
          {showDropdown && (
            <div className="absolute bg-LightSBg dark:bg-DarkSBg shadow-md border border-PrimaryButton mt-2 rounded-md z-10 max-h-60 overflow-y-auto w-full">
              {loading ? (
                <p className="p-4 text-gray-500">Loading...</p>
              ) : error ? (
                <p className="p-4 text-red-500">{error}</p>
              ) : (
                packers.map((packer, index) => (
                  <div
                    key={index}
                    className="p-2 hover:bg-LightPBg dark:hover:bg-DarkPBg cursor-pointer"
                    onClick={() => handleSelectPacker(packer)}
                  >
                    {packer.name}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        {/* Name Input */}
        <Input
          id="ratePerKg"
          label="Rate Per Kg"
          placeholder="Enter rate per kg"
          value={ratePerKg}
          onChange={(e) => setRatePerKg(e.target.value)}
        />

        {/* Save Button */}
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
