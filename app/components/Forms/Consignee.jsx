"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import SaveButton from "@components/Button/SaveButton";
import Input from "@components/Input";
import { useSearchParams, useRouter } from "next/navigation";
import LinkButton from "@components/Button/LinkButton";
import { FaEye } from "react-icons/fa";
import axiosInstance from "@utils/axiosConfig";
import { getCookie } from "cookies-next";
const MySwal = withReactContent(Swal);
export default function ConsigneeForm() {
  const token = getCookie("token");
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id"); // Extract the ID from query params
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    country: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      // Fetch the existing consingee data
      const fetchConsignee = async () => {
        try {
          const response = await axiosInstance.get(`/consignee/${id}`);
          const { data } = response;
          setFormData(data);
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to fetch consingee details.",
          });
        }
      };
      fetchConsignee();
    }
  }, [id]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.address || !formData.country) {
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
      const url = id ? `${apiUrl}/consignee/${id}` : `${apiUrl}/consignee`;
      // const response = await axiosInstance({
      //   method, // Use the dynamic method
      //   url, // Use the dynamic URL
      //   data: formData, // Pass the form data
      // });
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      const result = await Swal.fire({
        icon: "success",
        title: "Success",
        text: id
          ? "Consignee updated successfully."
          : "Consignee added successfully.",
      });
      if (response.ok) {
        setFormData({ name: "", address: "", country: "" }); // Clear form for new entry
      }
      if (result.isConfirmed) {
        router.push("view-consignee");
      }
    } catch (error) {
      console.error(error);
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
        <h2 className="text-xl font-semibold mb-8">Consignee</h2>
        <div>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter name"
            label="Name*"
          />
        </div>
        <div>
          <Input
            id="address"
            type="text"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            placeholder="Enter address"
            label="Address*"
          />
        </div>
        <div>
          <Input
            id="country"
            type="text"
            value={formData.country}
            onChange={(e) =>
              setFormData({ ...formData, country: e.target.value })
            }
            placeholder="Enter country"
            label="Country*"
          />
        </div>
        <SaveButton
          handleSubmit={handleSubmit}
          isLoading={loading}
          existingData={id ? true : false}
        />
      </div>
      <LinkButton
        href="/consignment/consignee/view-consignee"
        title="See your consignee"
        icon={FaEye}
        desc="Click to view your existing consignee"
      />
    </div>
  );
}
