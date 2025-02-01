"use client";

import UpdateConsignment from "../../../utils/updateConsignment";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import SaveButton from "@components/Button/SaveButton";
import Input from "@components/Input";
import { useRouter } from "next/navigation";
const MySwal = withReactContent(Swal);

export default function ConsigneeForm({
  consignmentId,
  existingData,
  setFormStatuses,
  setActiveAccordion,
}) {
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    country: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (existingData) {
      setFormData(existingData); // Pre-fill the form with existing data
    }
  }, [existingData]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.address || !formData.country) {
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

    setIsLoading(true);

    try {
      const url = existingData
        ? `${apiUrl}/consignee/${existingData.id}`
        : `${apiUrl}/consignee`;
      const method = existingData ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save data.");
      }

      const { id } = await response.json();

      if (existingData) {
        await UpdateConsignment(consignmentId, {
          consignee: { id, ...formData },
        });
      } else {
        await UpdateConsignment(
          consignmentId,
          { consignee: { id, ...formData } },
          "Consignee"
        );
      }
      setFormStatuses((prev) => ({
        ...prev,
        consignee: { id, ...formData },
      }));
      setActiveAccordion(null);
      MySwal.fire({
        icon: "success",
        title: "Success",
        text: existingData
          ? "Consignee updated successfully!"
          : "Consignee added successfully!",
      });

      if (!existingData) {
        setFormData({ name: "", address: "", country: "" }); // Clear form for new data
      }
    } catch (error) {
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while saving data.",
      });
    } finally {
      setIsLoading(false);
      router.refresh();
    }
  };

  return (
    <div className="space-y-4 text-LightPText dark:text-DarkPText w-full md:w-4/5 lg:w-1/2">
      <div className=" shadow-md rounded-md p-6 space-y-4 border-LightBorder dark:border-DarkBorder border-2">
        <div>
          <h2 className="text-xl font-semibold mb-8">Consignee</h2>

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
          isLoading={isLoading}
          existingData={existingData}
          classes={""}
        />
      </div>
    </div>
  );
}
