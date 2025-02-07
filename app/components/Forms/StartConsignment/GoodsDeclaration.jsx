"use client";

import UpdateConsignment from "@utils/updateConsignment";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import SaveButton from "@components/Button/SaveButton";
import Input from "@components/Input";
import { motion } from "framer-motion"; // Import Framer Motion
const MySwal = withReactContent(Swal);

export default function GoodsDeclarationForm({
  consignmentId,
  existingData,
  setFormStatuses,
  setActiveAccordion,
}) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const [formData, setFormData] = useState({
    number: "",
    date: "",
    exchangeRate: "",
    commercialInvoiceNumber: "",
    fob: "",
    gdFreight: "",
  });
  const [isLoading, setIsLoading] = useState(false); // Loader state

  useEffect(() => {
    if (existingData) {
      setFormData(existingData); // Pre-fill the form with existing data
    }
  }, [existingData]);

  const handleSubmit = async () => {
    if (
      !formData.number ||
      !formData.date ||
      !formData.exchangeRate ||
      !formData.commercialInvoiceNumber ||
      !formData.fob ||
      !formData.gdFreight
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
        formData.number === existingData.number &&
        formData.date === existingData.date &&
        formData.exchangeRate === existingData.exchangeRate &&
        formData.commercialInvoiceNumber ===
          existingData.commercialInvoiceNumber &&
        formData.fob === existingData.fob &&
        formData.gdFreight === existingData.gdFreight
      ) {
        MySwal.fire({
          icon: "error",
          title: "Same data",
          text: "Please make changes to update the data.",
        });
        return;
      } // Check if there are changes in existing data - if not, return
    }
    setIsLoading(true); // Start loading

    try {
      const url = existingData
        ? `${apiUrl}/goods-declaration/${existingData.id}`
        : `${apiUrl}/goods-declaration`;
      const method = existingData ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const { id } = await response.json();

      if (!existingData) {
        await UpdateConsignment(
          consignmentId,
          { goodsDeclaration: { id, ...formData } },
          "Pending"
        );
      }
      setFormStatuses((prev) => ({
        ...prev,
        goodsDeclaration: { id, ...formData },
      }));
      setActiveAccordion(null);
      if (!response.ok) {
        throw new Error("Failed to save data: Check your internet");
      }
      MySwal.fire({
        icon: "success",
        title: "Success",
        text: existingData
          ? "Goods Declaration updated successfully!"
          : "Goods Declaration added successfully!",
      });
      if (!existingData) {
        setFormData({
          number: "",
          date: "",
          exchangeRate: "",
          commercialInvoiceNumber: "",
          fob: "",
          gdFreight: "",
        });
      }
    } catch (error) {
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while saving data.",
      });
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <motion.div
      className="space-y-4 text-LightPText dark:text-DarkPText w-full md:w-4/5 lg:w-1/2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <motion.div
        className="shadow-md rounded-md p-6 space-y-4 border-LightBorder dark:border-DarkBorder border-2"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <h2 className="text-xl font-semibold mb-8">Goods Declaration</h2>

        {/* Animated Input Fields */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <Input
            id={"number"}
            type="number"
            label="Number"
            value={formData.number}
            onChange={(e) =>
              setFormData({ ...formData, number: e.target.value })
            }
            placeholder="Enter number*"
          />
          <Input
            id={"date"}
            type="date"
            label="Date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
          <Input
            type="number"
            step="0.01"
            label="Exchange Rate"
            value={formData.exchangeRate}
            onChange={(e) =>
              setFormData({ ...formData, exchangeRate: e.target.value })
            }
            placeholder="Enter exchange rate"
          />
          <Input
            id={"cin"}
            type="number"
            label="Commercial Invoice Number"
            value={formData.commercialInvoiceNumber}
            onChange={(e) =>
              setFormData({
                ...formData,
                commercialInvoiceNumber: e.target.value,
              })
            }
            placeholder="Enter Commercial Invoice Number"
          />
          <Input
            id={"fob"}
            type="number"
            step="0.01"
            label="FOB"
            value={formData.fob}
            onChange={(e) => setFormData({ ...formData, fob: e.target.value })}
            placeholder="Enter FOB"
          />
          <Input
            id={"GD-Freight"}
            type="number"
            step="0.01"
            label="GD Freight"
            value={formData.gdFreight}
            onChange={(e) =>
              setFormData({ ...formData, gdFreight: e.target.value })
            }
            placeholder="Enter GD Freight"
          />
        </motion.div>

        <SaveButton
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          existingData={existingData}
          classes=""
        />
      </motion.div>
    </motion.div>
  );
}
