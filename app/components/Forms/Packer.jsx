"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import SaveButton from "@components/Button/SaveButton";
import Input from "@components/Input";
import LinkButton from "@components/Button/LinkButton";
import { FaEye } from "react-icons/fa";
export default function Packer() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id"); // Extract the ID from query params
  const [name, setName] = useState("");
  const [station, setStation] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      // Fetch the existing packer data
      const fetchpacker = async () => {
        try {
          const response = await fetch(`${apiUrl}/packer/${id}`);
          const data = await response.json();
          setName(data?.name);
          setStation(data?.station);
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to fetch packer details.",
          });
        }
      };
      fetchpacker();
    }
  }, [id]);

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
      const url = id ? `${apiUrl}/packer/${id}` : `${apiUrl}/packer`;

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
          ? "packer updated successfully."
          : "packer added successfully.",
      });
      if (result.isConfirmed) {
        router.push("view-packer");
      }

      if (!id) {
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

  return (
    <div className="space-y-4 text-LightPText dark:text-DarkPText w-full md:w-4/5 lg:w-1/2">
      <div className=" shadow-md rounded-md p-6 space-y-4 border-LightBorder dark:border-DarkBorder border-2">
        <h2 className="text-xl font-semibold mb-8">Add Packer</h2>

        {/* Name Input */}
        <Input
          type="text"
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* Station Input */}
        <Input
          type="text"
          placeholder="Enter Station"
          value={station}
          onChange={(e) => setStation(e.target.value)}
        />

        {/* Save Button */}
        <SaveButton
          handleSubmit={handleSubmit}
          isLoading={loading}
          existingData={id ? true : false}
        />
      </div>
      <LinkButton
        href="/consignment/packer/view-packer"
        title="See your packers"
        icon={FaEye}
        desc="Click to view your existing packers"
      />
    </div>
  );
}
