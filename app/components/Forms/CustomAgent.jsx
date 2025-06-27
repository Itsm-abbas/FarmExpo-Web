"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import SaveButton from "@components/Button/SaveButton";
import Input from "@components/Input";
import LinkButton from "@components/Button/LinkButton";
import { FaEye } from "react-icons/fa";
import axiosInstance from "@utils/axiosConfig";
import { getCookie } from "cookies-next";
export default function CustomAgent() {
  const token = getCookie("token");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id"); // Extract the ID from query params
  const [name, setName] = useState("");
  const [station, setStation] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      // Fetch the existing customagent data
      const fetchCustomAgents = async () => {
        try {
          const response = await axiosInstance.get(`/customagent/${id}`);
          const { data } = response;
          setName(data?.name);
          setStation(data?.station);
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to fetch customagent details.",
          });
        }
      };
      fetchCustomAgents();
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
      const url = id ? `${apiUrl}/customagent/${id}` : `${apiUrl}/customagent`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, station }),
      });

      if (!response.ok) {
        throw new Error("Failed to save data");
      }

      if (response.ok) {
        Swal.fire({
          position: "top-center",
          icon: "success",
          title: id ? "Updated successfully." : "Added successfully.",
          showConfirmButton: false,
          timer: 1500,
        });
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
        <h2 className="text-xl font-semibold mb-8">Custom Agent</h2>

        {/* Name Input */}
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter Name"
        />

        {/* Station Input */}
        <Input
          label="Station"
          value={station}
          onChange={(e) => setStation(e.target.value)}
          placeholder="Enter Station"
        />

        {/* Save Button */}
        <SaveButton
          handleSubmit={handleSubmit}
          isLoading={loading}
          existingData={id ? true : false}
        />
      </div>
      <LinkButton
        href="/consignment/customagent/view-customAgent"
        title="See your custom agents"
        icon={FaEye}
        desc="Click to view your existing custom agents"
      />
    </div>
  );
}
