"use client";

import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import SaveButton from "@components/Button/SaveButton";
import Input from "@components/Input";
import { FaEye } from "react-icons/fa";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import LinkButton from "@components/Button/LinkButton";
export default function IataAgent() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id"); // Extract the ID from query params
  const [name, setName] = useState("");
  const [station, setStation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !station) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please fill in all the fields.",
      });
      return;
    }

    setLoading(true);
    try {
      const method = id ? "PUT" : "POST";
      const url = id ? `${apiUrl}/iataagent/${id}` : `${apiUrl}/iataagent`;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, station }),
      });

      if (!response.ok) {
        throw new Error("Failed to save data");
      }

      const result = await Swal.fire({
        icon: "success",
        title: "Success",
        text: id
          ? "Iata Agent updated successfully."
          : "Iata Agent added successfully.",
      });
      if (result.isConfirmed) {
        router.push("view-iataAgent");
      }

      if (response.ok) {
        setName("");
        setStation("");
      } // Clear form for new entry
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while saving data.",
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (id) {
      // Fetch the existing IataAgent data
      const fetchIataAgent = async () => {
        try {
          const response = await fetch(`${apiUrl}/iataagent/${id}`);
          const data = await response.json();
          setName(data?.name);
          setStation(data?.station);
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to fetch IataAgent details.",
          });
        }
      };
      fetchIataAgent();
    }
  }, [id]);
  return (
    <div className="space-y-4 text-LightPText dark:text-DarkPText w-full md:w-4/5 lg:w-1/2">
      <div className=" shadow-md rounded-md p-6 space-y-4 border-LightBorder dark:border-DarkBorder border-2">
        <h2 className="text-xl font-semibold mb-4 capitalize">
          {id ? "Edit IATA agent" : "IATA Agent"}
        </h2>

        {/* Name Input */}
        <Input
          id={"name"}
          type="text"
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          label="Name"
        />

        {/* Station Input */}
        <Input
          id={"station"}
          type="text"
          placeholder="Enter Station"
          value={station}
          onChange={(e) => setStation(e.target.value)}
          label="Station"
        />
        {/* Save Button */}
        <SaveButton
          handleSubmit={handleSubmit}
          isLoading={loading}
          existingData={id ? true : false}
        />
      </div>
      <LinkButton
        href="/consignment/iata-agent/view-iataAgent"
        title="See your IATA Agents"
        icon={FaEye}
        desc="Click to view your existing IATA Agents"
      />
    </div>
  );
}
