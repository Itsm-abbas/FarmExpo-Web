"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Input from "@components/Input";

const MySwal = withReactContent(Swal);

export default function DamageForm({
  consignmentId,
  setFormStatuses,
  setActiveAccordion,
}) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [loadingStates, setLoadingStates] = useState({}); // Track loading per item
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({});

  // Fetch consignment data to get goods
  useEffect(() => {
    const fetchConsignmentData = async () => {
      try {
        const response = await fetch(`${apiUrl}/consignment/${consignmentId}`);
        if (!response.ok) throw new Error("Failed to fetch consignment data.");
        const data = await response.json();
        setItems(data.goods || []);
        setFormData(
          data.goods.reduce(
            (acc, item) => ({
              ...acc,
              [item.id]: item.damage || "",
            }),
            {}
          )
        );
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message,
        });
      }
    };

    fetchConsignmentData();
  }, [consignmentId]);

  // Handle save for a specific item
  const handleSubmit = async (itemId) => {
    if (!formData[itemId]) {
      MySwal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please fill in the damage value.",
      });
      return;
    }

    setLoadingStates((prev) => ({ ...prev, [itemId]: true })); // Set loading for specific item

    try {
      const targetItem = items.find((item) => item.id === itemId);
      if (!targetItem) throw new Error("Item not found.");

      const updatedItem = {
        ...targetItem,
        damage: parseFloat(formData[itemId]),
      };

      const response = await fetch(`${apiUrl}/consignmentitem/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedItem),
      });

      if (!response.ok) {
        throw new Error("Failed to update consignment item.");
      }

      const updatedItems = items.map((item) =>
        item.id === itemId ? updatedItem : item
      );

      setItems(updatedItems);
      setFormStatuses((prev) => ({
        ...prev,
        goods: updatedItems,
      }));

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Damage updated successfully!",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "An error occurred while updating the damage.",
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, [itemId]: false })); // Reset loading for specific item
    }
  };

  return (
    <div className="space-y-4 text-LightPText dark:text-DarkPText w-full md:w-4/5 lg:w-1/2">
      {items.map((item) => (
        <div
          key={item.id}
          className="shadow-md  rounded-md p-6 space-y-4 border-LightBorder dark:border-DarkBorder border-2"
        >
          <div>
            <h2 className="text-xl font-semibold mb-8 capitalize">
              {item.item.name}
            </h2>

            <Input
              type="number"
              id={`damage-${item.id}`}
              label="Damage"
              value={formData[item.id]}
              onChange={(e) =>
                setFormData({ ...formData, [item.id]: e.target.value })
              }
              placeholder="Enter damaged quantity"
            />
          </div>

          <button
            onClick={() => handleSubmit(item.id)}
            className={`uppercase w-full px-4 py-2 rounded-md text-white transition-all duration-200 ${
              loadingStates[item.id]
                ? "bg-[#A7F3D0] cursor-not-allowed"
                : "bg-PrimaryButton hover:bg-PrimaryButtonHover"
            } ${
              formData[item.id] &&
              "bg-SecondaryButton hover:bg-SecondaryButtonHover"
            }`}
            disabled={loadingStates[item.id]}
          >
            {loadingStates[item.id]
              ? "Saving..."
              : formData[item.id]
              ? "update"
              : "Save"}
          </button>
        </div>
      ))}
    </div>
  );
}
