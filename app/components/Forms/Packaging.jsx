"use client";

import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import SaveButton from "@components/Button/SaveButton";
import Input from "@components/Input";
import LinkButton from "@components/Button/LinkButton";
import { FaEye } from "react-icons/fa";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
export default function Packaging() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id"); // Extract the ID from query params
  const [name, setName] = useState("");
  const [packagingWeightPerUnit, setPackagingWeightPerUnit] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      // Fetch the existing packaging data
      const fetchpackaging = async () => {
        try {
          const response = await fetch(`${apiUrl}/packaging/${id}`);
          const data = await response.json();
          setName(data?.name);
          setPackagingWeightPerUnit(data?.packagingWeightPerUnit);
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to fetch packaging details.",
          });
        }
      };
      fetchpackaging();
    }
  }, [id]);

  const handleSubmit = async () => {
    if (!name || !packagingWeightPerUnit) {
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
      const url = id ? `${apiUrl}/packaging/${id}` : `${apiUrl}/packaging`;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, packagingWeightPerUnit }),
      });

      if (!response.ok) {
        throw new Error("Failed to save data");
      }

      const result = await Swal.fire({
        icon: "success",
        title: "Success",
        text: id
          ? "packaging updated successfully."
          : "packaging added successfully.",
      });
      if (result.isConfirmed) {
        router.push("view-packaging");
      }

      if (!id) {
        setName("");
        setPackagingWeightPerUnit("");
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
        <h2 className="text-xl font-semibold mb-8">Add packaging</h2>

        {/* Name Input */}
        <Input
          type="text"
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* Package Per Unit Weight Input */}
        <Input
          type="text"
          placeholder="Enter Packaging Weight Per Unit Cost"
          value={packagingWeightPerUnit}
          onChange={(e) => setPackagingWeightPerUnit(e.target.value)}
        />

        {/* Save Button */}
        <SaveButton
          handleSubmit={handleSubmit}
          isLoading={loading}
          existingData={id ? true : false}
        />
      </div>
      <LinkButton
        href="/consignment/packaging/view-packaging"
        title="See your packagings"
        icon={FaEye}
        desc="Click to view your existing packagings"
      />
    </div>
  );
}
