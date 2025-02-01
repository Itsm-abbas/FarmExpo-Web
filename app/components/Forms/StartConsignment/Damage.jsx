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
  const [isLoading, setIsLoading] = useState(false);
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

    setIsLoading(true);

    try {
      // Find the specific item to update
      const targetItem = items.find((item) => item.id === itemId);
      if (!targetItem) throw new Error("Item not found.");

      // Create the updated item object
      const updatedItem = {
        id: targetItem.id,
        item: targetItem.item,
        packaging: targetItem.packaging,
        weightPerUnit: targetItem.weightPerUnit,
        commodityPerUnitCost: targetItem.commodityPerUnitCost,
        packagingPerUnitCost: targetItem.packagingPerUnitCost,
        quantity: targetItem.quantity,
        damage: parseFloat(formData[itemId]), // Add the updated damage
      };

      // Send the updated item to the API
      const response = await fetch(`${apiUrl}/consignmentitem/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedItem),
      });

      if (!response.ok) {
        throw new Error("Failed to update consignment item.");
      }

      // Update local state
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
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 text-LightPText dark:text-DarkPText w-full md:w-4/5 lg:w-1/2">
      {items.map((item) => (
        <div
          key={item.id}
          className="shadow-md rounded-md p-6 space-y-4 border-LightBorder dark:border-DarkBorder border-2"
        >
          <div>
            <h2 className="text-xl font-semibold mb-8 capitalize">
              {item.item.name}
            </h2>

            <Input
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
            className={`uppercase w-full px-4 py-2 rounded-md text-white ${
              isLoading
                ? "bg-[#A7F3D0] cursor-not-allowed"
                : "bg-PrimaryButton hover:bg-PrimaryButtonHover"
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      ))}
    </div>
  );
}
