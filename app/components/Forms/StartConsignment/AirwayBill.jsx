"use client";
import UpdateConsignment from "@utils/updateConsignment";
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import SaveButton from "@components/Button/SaveButton";
import Input from "@components/Input";
const MySwal = withReactContent(Swal);
export default function AirwayBill({
  consignmentId,
  existingData,
  setFormStatuses,
  setActiveAccordion,
}) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [number, setNumber] = useState("");
  const [rate, setRate] = useState("");
  const [airwayBillWeight, setAirwayBillWeight] = useState("");
  const [fee, setFee] = useState("");

  // Date picker
  const [date, setDate] = useState(new Date());
  const [formattedDate, setFormattedDate] = useState("");

  // Selecting IATA Agent
  const [selectedAgent, setSelectedAgent] = useState(null); // Selected IATA Agent
  const [showDropdown, setShowDropdown] = useState(false); // Toggle dropdown visibility
  const [iataAgents, setIataAgents] = useState([]); // IATA Agents fetched from API
  const [loading, setLoading] = useState(false); // Loading state for API call
  const [error, setError] = useState(null); // Error state for API call

  const onChangeDate = (e) => {
    const selectedDate = new Date(e.target.value);
    setDate(selectedDate);
    setFormattedDate(selectedDate.toISOString().split("T")[0]);
  };

  // When an agent is selected
  const handleSelectAgent = (agentDetail) => {
    setSelectedAgent(agentDetail);
    setShowDropdown(false); // Close dropdown
  };

  // Save Data
  const handleSubmit = async () => {
    if (
      !number ||
      !fee ||
      !rate ||
      !airwayBillWeight ||
      selectedAgent === undefined
    ) {
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
        number,
        iataAgent: selectedAgent, // Pass the selected agent
        dateTime: date,
        rate,
        airwayBillWeight,
        fee,
      };
      const url = existingData
        ? `${apiUrl}/airwaybill/${existingData.id}`
        : `${apiUrl}/airwaybill`;
      const method = existingData ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const { id } = await response.json();

      if (existingData) {
        await UpdateConsignment(consignmentId, {
          airwayBill: { id, ...payload },
        });
      } else {
        await UpdateConsignment(
          consignmentId,
          { airwayBill: { id, ...payload } },
          "Airway Bill"
        );
      }
      setFormStatuses((prev) => ({
        ...prev,
        airwayBill: { id, ...payload },
      }));
      setActiveAccordion(null);
      if (!response.ok) {
        throw new Error("Failed to save data");
      }

      MySwal.fire({
        icon: "success",
        title: "Success",
        text: existingData
          ? "Airway bill updated successfully!"
          : "Airway bill added successfully!",
      });

      if (!existingData) {
        // Clear form for new data
        setNumber("");
        setRate("");
        setAirwayBillWeight("");
        setFee("");
        setSelectedAgent("");
        setFormattedDate("");
      }
    } catch (error) {
      setLoading(false);
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while saving data.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch IATA Agents
  useEffect(() => {
    const fetchIataAgents = async () => {
      try {
        const response = await fetch(`${apiUrl}/iataagent`);
        const data = await response.json();
        setIataAgents(data); // Assuming data is an array of agents
      } catch (error) {
        console.error("Error fetching IATA agents:", error);
        setError("Failed to load IATA agents.");
      }
    };

    fetchIataAgents();
  }, []);
  useEffect(() => {
    if (existingData) {
      // Pre-fill the form with existing data
      setAirwayBillWeight(existingData.airwayBillWeight);
      const date = new Date(existingData.dateTime); // Convert the string to a Date object
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
      const day = String(date.getDate()).padStart(2, "0");
      setFormattedDate(`${year}-${month}-${day}`);
      setFee(existingData.fee);
      setNumber(existingData.number);
      setRate(existingData.rate);
      setSelectedAgent(existingData.iataAgent);
    }
  }, [existingData]);
  return (
    <div className="space-y-4 text-LightPText dark:text-DarkPText w-full md:w-4/5 lg:w-1/2">
      <div className=" shadow-md rounded-md p-6 space-y-4 border-LightBorder dark:border-DarkBorder border-2">
        <h2 className="text-xl font-semibold mb-8">Airway Bill</h2>
        {/* Number */}
        <Input
          id="number"
          type="text"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="Enter Airway Bill Number"
          label="Airway Bill Number*"
        />

        {/* IATA Agent Dropdown */}

        <div className="relative">
          <label htmlFor="IATA" className="block mb-2 text-sm font-medium">
            IATA Agent*
          </label>
          <button
            className={`${
              showDropdown
                ? "border border-PrimaryButton"
                : "border border-LightBorder dark:border-DarkBorder"
            } w-full  p-2 rounded-md text-left`}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            {selectedAgent?.name || "Select IATA Agent"}
          </button>
          {showDropdown && (
            <div className="absolute bg-LightSBg dark:bg-DarkSBg shadow-md border border-PrimaryButton mt-2 rounded-md z-10 max-h-60 overflow-y-auto w-full">
              {loading ? (
                <p className="p-4 text-gray-500">Loading...</p>
              ) : error ? (
                <p className="p-4 text-red-500">{error}</p>
              ) : (
                iataAgents.map((agent, index) => (
                  <div
                    key={index}
                    className="p-2 hover:bg-LightPBg dark:hover:bg-DarkPBg cursor-pointer"
                    onClick={() => handleSelectAgent(agent)}
                  >
                    {agent.name}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Date Picker */}

        <Input
          id="date"
          type="date"
          name="Date*"
          value={formattedDate}
          onChange={onChangeDate}
          label="Date*"
        />

        {/* Rate */}
        <Input
          id="rate"
          type="number"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          placeholder="Enter Rate"
          label="Rate*"
        />

        {/* Airway Bill Weight */}
        <Input
          id="airwayBillWeight"
          type="number"
          value={airwayBillWeight}
          onChange={(e) => setAirwayBillWeight(e.target.value)}
          placeholder="Enter Airway Bill Weight"
          label="Airway Bill Weight*"
        />
        {/* Fee */}
        <Input
          id="fee"
          type="number"
          value={fee}
          onChange={(e) => setFee(e.target.value)}
          placeholder="Enter Fee"
          label="Fee*"
        />

        {/* Save Button */}
        <SaveButton
          handleSubmit={handleSubmit}
          isLoading={loading}
          existingData={existingData}
          classes=""
        />
      </div>
    </div>
  );
}
