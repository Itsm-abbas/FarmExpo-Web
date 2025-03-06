"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import Input from "@components/Input";
import SaveButton from "@components/Button/SaveButton";
import { useQuery } from "@tanstack/react-query";
import { getCookie } from "cookies-next";
import {
  fetchFinancialInstrument,
  fetchGoodsDeclaration,
} from "@constants/consignmentAPI";

export default function FinancialInstrumentUtilizedForm() {
  const token = getCookie("token");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [selectedFi, setSelectedFi] = useState("");
  const [selectedGd, setSelectedGd] = useState("");
  const [isGoodsVerified, setIsGoodsVerified] = useState(false);

  // Fetch financial instruments
  const { isLoading: FiLoading, data: FiData } = useQuery({
    queryKey: ["financialinstrument"],
    queryFn: fetchFinancialInstrument,
  });

  // Fetch goods declarations
  const { isLoading: GdLoading, data: GdData } = useQuery({
    queryKey: ["goodsDeclaration"],
    queryFn: fetchGoodsDeclaration,
  });

  const [formData, setFormData] = useState({
    financialInstrument: "",
    goodsDeclaration: "",
    utilized: "",
    isGoodsVerified: false,
  });

  const [submitLoading, setSubmitLoading] = useState(false);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      const response = await fetch(`${apiUrl}/fiu`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok)
        throw new Error("Failed to save financial instrument utilized");

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Financial Instrument Utilized added successfully!",
      });

      // Reset form data
      setFormData({
        financialInstrument: "",
        goodsDeclaration: "",
        utilized: "",
        isGoodsVerified: false,
      });
      setSelectedFi("");
      setSelectedGd("");
      setIsGoodsVerified(false);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle financial instrument selection
  const handleFiChange = (e) => {
    const selectedId = e.target.value;
    const fi = FiData.find((f) => f.id === parseInt(selectedId));
    setFormData({ ...formData, financialInstrument: fi });
    setSelectedFi(fi);
  };

  // Handle goods declaration selection
  const handleGdChange = (e) => {
    const selectedId = e.target.value;
    const gd = GdData.find((g) => g.id === parseInt(selectedId));
    setFormData({ ...formData, goodsDeclaration: gd });
    setSelectedGd(gd);
  };

  // Handle goods verification checkbox
  const handleGoodsVerification = (e) => {
    setIsGoodsVerified(e.target.checked);
    setFormData({ ...formData, isGoodsVerified: e.target.checked });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-6 w-full max-w-lg mx-auto"
    >
      <h2 className="text-2xl font-bold mb-6 text-center">
        Financial Instrument Utilized
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Financial Instrument Dropdown */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block text-sm font-medium mb-1">
            Financial Instrument
          </label>
          <select
            id="financialInstrument"
            className="w-full p-2 border rounded-md bg-LightPBg dark:bg-DarkPBg dark:text-white"
            value={selectedFi?.id || ""}
            onChange={handleFiChange}
          >
            <option value="">Select Financial Instrument</option>
            {FiData?.map((fi) => (
              <option key={fi.id} value={fi.id}>
                {fi.number}
              </option>
            ))}
          </select>
        </motion.div>

        {/* Goods Declaration Dropdown */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <label className="block text-sm font-medium mb-1">
            Goods Declaration
          </label>
          <select
            id="goodsDeclaration"
            className="w-full p-2 border rounded-md bg-LightPBg dark:bg-DarkPBg dark:text-white"
            value={selectedGd?.id || ""}
            onChange={handleGdChange}
          >
            <option value="">Select Goods Declaration</option>
            {GdData?.map((gd) => (
              <option key={gd.id} value={gd.id}>
                {gd.number}
              </option>
            ))}
          </select>
        </motion.div>

        {/* Utilized Amount Input */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Input
            id="utilized"
            label="Utilized Amount"
            type="number"
            value={formData.utilized}
            onChange={(e) =>
              setFormData({ ...formData, utilized: e.target.value })
            }
          />
        </motion.div>

        {/* Goods Verification Checkbox */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="flex items-center space-x-2"
        >
          <input
            type="checkbox"
            id="isGoodsVerified"
            checked={isGoodsVerified}
            onChange={handleGoodsVerification}
            className="w-4 h-4 rounded"
          />
          <label htmlFor="isGoodsVerified" className="text-sm">
            Verify Goods Declaration
          </label>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <SaveButton
            handleSubmit={handleSubmit}
            submitLoading={submitLoading}
          />
        </motion.div>
      </form>
    </motion.div>
  );
}
