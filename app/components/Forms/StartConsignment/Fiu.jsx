"use client";

import SaveButton from "@components/Button/SaveButton";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Input from "@components/Input";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { fetchFinancialInstrument, fetchFiu } from "@constants/consignmentAPI";

const MySwal = withReactContent(Swal);

const FIU = ({ setShowFinancialUtilization, formStatus }) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const queryClient = useQueryClient();

  const [selectedFi, setSelectedFi] = useState("");
  const [utilizedAmount, setUtilizedAmount] = useState("");

  // Fetch available financial instruments
  const { data: FiData, isLoading: FiLoading } = useQuery({
    queryKey: ["financialinstrument"],
    queryFn: fetchFinancialInstrument,
  });

  // Fetch FIU data using goodsDeclaration ID
  const { data: FiuData, refetch: refetchFiu } = useQuery({
    queryKey: ["fiu"],
    queryFn: fetchFiu,
  });

  // Find existing FIU entry based on goodsDeclaration ID
  const foundUtilization = FiuData?.find(
    (utilization) =>
      utilization.goodsDeclaration?.id === formStatus.goodsDeclaration?.id
  );

  // Pre-fill form if FIU exists
  useEffect(() => {
    if (foundUtilization && formStatus.goodsDeclaration?.id) {
      setSelectedFi(foundUtilization.financialInstrument);
      setUtilizedAmount(foundUtilization.utilized);
    }
  }, [foundUtilization]);

  // Mutation for submitting FIU data
  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        financialInstrument: selectedFi,
        goodsDeclaration: formStatus?.goodsDeclaration,
        utilized: utilizedAmount,
      };
      if (foundUtilization?.id) {
        // Update existing FIU
        return axios.put(`${apiUrl}/fiu/${foundUtilization.id}`, payload);
      } else {
        // Create new FIU
        return axios.post(`${apiUrl}/fiu`, payload);
      }
    },
    onSuccess: () => {
      MySwal.fire({
        icon: "success",
        title: "Success",
        text: "Financial Instrument Utilized updated successfully!",
      });
      queryClient.invalidateQueries(["financialinstrumentutilized"]);
      setShowFinancialUtilization(false);
    },
    onError: (error) => {
      console.log(error);
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Something went wrong!",
      });
    },
  });

  // Handle form submission
  const handleFinancialUtilizationSubmit = async () => {
    if (!formStatus?.goodsDeclaration) {
      MySwal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please enter goods declaration",
      });
      setShowFinancialUtilization(false);
      return;
    }
    if (!selectedFi || !utilizedAmount) {
      MySwal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please select a financial instrument and enter the utilized amount.",
      });
      return;
    }

    mutation.mutate();
  };

  // Handle financial instrument selection
  const handleFiChange = (e) => {
    const selectedId = e.target.value;
    const fi = FiData.find((f) => f.id === parseInt(selectedId));
    setSelectedFi(fi);
  };

  // Toggle financial utilization form
  const handleFiForm = () => {
    setShowFinancialUtilization((prev) => !prev);
  };

  return (
    <motion.div
      className="shadow-md rounded-md p-6 space-y-4 border-LightBorder dark:border-DarkBorder border-2"
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <h2 className="text-xl font-semibold mb-8">Financial Utilization</h2>

      <motion.div
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
      >
        {/* Financial Instrument Dropdown */}
        <div>
          <motion.label
            className="block text-sm font-medium mb-1"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Financial Instrument
          </motion.label>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <select
              className="w-full p-2 border rounded-md bg-LightPBg dark:bg-DarkPBg dark:text-white"
              value={selectedFi?.id || ""}
              onChange={handleFiChange}
            >
              {FiLoading ? (
                <option value="">Loading...</option>
              ) : (
                <option value="">Select Financial Instrument</option>
              )}
              {FiData?.map((fi) => (
                <option key={fi.id} value={fi.id}>
                  {fi.number}
                </option>
              ))}
            </select>
          </motion.div>
        </div>

        {/* Utilized Amount Input */}
        <Input
          id="utilized"
          label="Utilized Amount"
          type="number"
          placeholder={"Utilized"}
          value={utilizedAmount}
          onChange={(e) => setUtilizedAmount(e.target.value)}
        />
      </motion.div>

      <SaveButton
        handleSubmit={handleFinancialUtilizationSubmit}
        isLoading={mutation.isLoading}
        existingData={foundUtilization?.goodsDeclaration?.id ? true : false}
      />
      <button
        onClick={handleFiForm}
        className="flex item-center capitalize justify-center w-full bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 transition-all py-2 rounded-sm"
      >
        Update goods declaration
      </button>
    </motion.div>
  );
};

export default FIU;
