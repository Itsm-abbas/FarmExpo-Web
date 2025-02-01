"use client";
import React, { useState, useEffect } from "react";
import UpdateConsignment from "@utils/updateConsignment";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import SaveButton from "@components/Button/SaveButton";
import Input from "@components/Input";
const MySwal = withReactContent(Swal);

export default function CustomClearence({
  consignmentId,
  existingData,
  setFormStatuses,
  setActiveAccordion,
}) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [fee, setFee] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCustomAgent, setSelectedCustomAgent] = useState(null); // Selected custom agent
  const [showDropdown, setShowDropdown] = useState(false); // Toggle dropdown visibility
  const [customAgents, setCustomAgents] = useState([]); // Custom agents fetched from API
  const [error, setError] = useState(null); // Error state for API call

  useEffect(() => {
    if (existingData) {
      setSelectedCustomAgent(existingData.ca); // Pre-select the existing agent
      setFee(existingData.fee); // Pre-fill the fee
    }
  }, [existingData]);
  // Handle selecting a custom agent
  const handleSelectCustomAgent = (agent) => {
    setSelectedCustomAgent(agent);
    setShowDropdown(false); // Close dropdown
  };

  // Save Data
  const handleSubmit = async () => {
    if (!fee || !selectedCustomAgent) {
      MySwal.fire({
        icon: "error",
        title: "Oops...",
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
        ca: selectedCustomAgent, // Pass the full selected agent
        fee,
      };
      const url = existingData
        ? `${apiUrl}/customclearance/${existingData.id}`
        : `${apiUrl}/customclearance`;
      const method = existingData ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const { id } = await response.json();

      if (existingData) {
        await UpdateConsignment(consignmentId, {
          customClearance: { id, ...payload },
        });
      } else {
        await UpdateConsignment(
          consignmentId,
          { customClearance: { id, ...payload } },
          "Custom Clearence"
        );
      }
      setFormStatuses((prev) => ({
        ...prev,
        customClearance: { id, ...payload },
      }));
      setActiveAccordion(null);
      if (!response.ok) {
        throw new Error("Failed to save data");
      }
      MySwal.fire({
        icon: "success",
        title: "Success",
        text: existingData
          ? "Custom Clearence updated successfully!"
          : "Custom Clearence added successfully!",
      });

      if (!existingData) {
        setFee("");
        setSelectedCustomAgent(null);
      }
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

  // Fetch custom agents
  useEffect(() => {
    const fetchCustomAgents = async () => {
      try {
        const response = await fetch(`${apiUrl}/customagent`);
        const data = await response.json();
        setCustomAgents(data);
      } catch (error) {
        console.error("Error fetching custom agents:", error);
        setError("Failed to load custom agents.");
      }
    };

    fetchCustomAgents();
  }, []);

  return (
    <div className="space-y-4 text-LightPText dark:text-DarkPText w-full md:w-4/5 lg:w-1/2">
      <div className=" shadow-md rounded-md p-6 space-y-4 border-LightBorder dark:border-DarkBorder border-2">
        <h2 className="text-xl font-semibold mb-8">Custom Clearance</h2>

        {/* Custom Agent Dropdown */}
        <div className="relative mb-8">
          <button
            className={`${
              showDropdown
                ? "border border-PrimaryButton"
                : "border border-LightBorder dark:border-DarkBorder"
            } w-full  p-2 rounded-md text-left`}
            onClick={() => setShowDropdown((prev) => !prev)}
          >
            {selectedCustomAgent
              ? selectedCustomAgent.name
              : "Select Custom Agent"}
          </button>
          {showDropdown && (
            <div className="absolute bg-LightSBg dark:bg-DarkSBg shadow-md border border-PrimaryButton mt-2 rounded-md z-10 max-h-60 overflow-y-auto w-full">
              {loading ? (
                <p className="p-4 text-LightPText dark:text-DarkPText">
                  Loading...
                </p>
              ) : error ? (
                <p className="p-4 text-red-500">{error}</p>
              ) : (
                customAgents.map((agent, index) => (
                  <div
                    key={index}
                    className="p-2 hover:bg-LightPBg dark:hover:bg-DarkPBg cursor-pointer"
                    onClick={() => handleSelectCustomAgent(agent)}
                  >
                    {agent.name}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Fee Input */}
        <Input
          id={"fee"}
          type="number"
          value={fee}
          onChange={(e) => setFee(e.target.value)}
          placeholder="Enter fee"
          label={"Fee*"}
        />

        {/* Save Button */}
        <SaveButton
          existingData={existingData}
          handleSubmit={handleSubmit}
          isLoading={loading}
        />
      </div>
    </div>
  );
}
