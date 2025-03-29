"use client";

import SaveButton from "@components/Button/SaveButton";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Input from "@components/Input";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchFinancialInstrument, fetchFiu } from "@constants/consignmentAPI";
import axiosInstance from "@utils/axiosConfig";
import { FaArrowLeft } from "react-icons/fa";

const MySwal = withReactContent(Swal);

const FIU = ({ setShowFinancialUtilization, formStatus }) => {
  const queryClient = useQueryClient();
  const [selectedFis, setSelectedFis] = useState([]);
  const [utilizations, setUtilizations] = useState([]);

  // Fetch financial instruments
  const { data: FiData, isLoading: FiLoading } = useQuery({
    queryKey: ["financialinstrument"],
    queryFn: fetchFinancialInstrument,
  });

  // Fetch existing FIU data
  const { data: FiuData } = useQuery({
    queryKey: ["fiu"],
    queryFn: fetchFiu,
  });

  useEffect(() => {
    if (FiuData && formStatus.goodsDeclaration?.id) {
      const existingUtilizations = FiuData.filter(
        (utilization) =>
          utilization.goodsDeclaration?.id === formStatus.goodsDeclaration?.id
      ).map((util) => ({
        id: util.id,
        financialInstrumentId: util.financialInstrument?.id || "",
        utilized: util.utilized || "",
      }));

      setUtilizations(
        existingUtilizations.length > 0
          ? existingUtilizations
          : [{ financialInstrumentId: "", utilized: "" }]
      );
      setSelectedFis(
        existingUtilizations.map((util) => util.financialInstrumentId)
      );
    } else {
      setUtilizations([{ financialInstrumentId: "", utilized: "" }]); // Ensure first FIU is always shown
    }
  }, [FiuData, formStatus]);

  const mutation = useMutation({
    mutationFn: async () => {
      const updatedFius = await Promise.all(
        utilizations.map(async (utilization) => {
          const selectedFi = FiData.find(
            (fi) => Number(fi.id) === Number(utilization.financialInstrumentId)
          );
          if (!selectedFi) {
            return null;
          }

          // Find existing FIU record for this financial instrument
          const existingFiu = FiuData?.find(
            (fiu) =>
              fiu.financialInstrument?.id === selectedFi.id &&
              fiu.goodsDeclaration?.id === formStatus?.goodsDeclaration?.id
          );

          let newBalance = selectedFi.balance;
          if (existingFiu) {
            // First, add back the last detected balance
            newBalance += existingFiu.utilized;
          }

          // Deduct the new utilization amount
          newBalance -= utilization.utilized;

          // Check if there is enough balance
          if (newBalance < 0) {
            throw new Error(
              `Insufficient balance in financial instrument ${selectedFi.number}.`
            );
          }

          const payload = {
            financialInstrument: selectedFi,
            goodsDeclaration: formStatus?.goodsDeclaration,
            utilized: utilization.utilized,
          };

          try {
            // Update financial instrument balance
            await axiosInstance.put(`/financialinstrument/${selectedFi.id}`, {
              ...selectedFi,
              balance: newBalance,
            });

            // Check if FIU already exists or needs to be created
            if (utilization?.id) {
              return await axiosInstance.put(`/fiu/${utilization.id}`, payload);
            } else {
              await axiosInstance.post(`/fiu`, payload);
            }
          } catch (error) {
            console.error("Error updating FIU:", error);
            throw error; // Ensure error gets caught by `onError`
          }
        })
      );

      return updatedFius.filter(Boolean); // Remove any `null` values
    },
    onSuccess: () => {
      MySwal.fire({
        icon: "success",
        title: "Success",
        text: "Financial Instrument Utilized updated successfully!",
      });
      queryClient.invalidateQueries(["financialinstrument"]);
      queryClient.invalidateQueries(["fiu"]);
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Something went wrong!",
      });
    },
  });

  const handleFinancialUtilizationSubmit = async () => {
    if (!formStatus?.goodsDeclaration) {
      MySwal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please enter goods declaration",
      });
      return;
    }

    if (
      utilizations.some(
        (util) =>
          !util.financialInstrumentId || !util.utilized || isNaN(util.utilized)
      )
    ) {
      MySwal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please fill in all fields with valid numbers.",
      });
      return;
    }

    mutation.mutate();
  };

  const handleFiChange = (index, fiId) => {
    const updatedUtilizations = [...utilizations];
    updatedUtilizations[index].financialInstrumentId = fiId;
    setUtilizations(updatedUtilizations);
    setSelectedFis(
      updatedUtilizations.map((util) => util.financialInstrumentId)
    );
  };

  const handleAmountChange = (index, value) => {
    const updatedUtilizations = [...utilizations];
    updatedUtilizations[index].utilized = value;
    setUtilizations(updatedUtilizations);
  };

  const addNewUtilization = () => {
    setUtilizations([
      ...utilizations,
      { financialInstrumentId: "", utilized: "" },
    ]);
  };

  return (
    <motion.div
      className="shadow-md rounded-md p-6 space-y-4 border-LightBorder dark:border-DarkBorder border-2"
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <h2 className="text-xl font-semibold mb-8">Financial Utilization</h2>

      {utilizations.map((util, index) => (
        <motion.div key={index} className="space-y-4">
          {/* Financial Instrument Dropdown */}
          <div>
            <motion.label className="block text-sm font-medium mb-1">
              Financial Instrument
            </motion.label>
            <motion.div>
              <select
                className="w-full p-2 border rounded-md bg-LightPBg dark:bg-DarkPBg dark:text-white"
                value={util.financialInstrumentId || ""}
                onChange={(e) => handleFiChange(index, e.target.value)}
              >
                {FiLoading ? (
                  <option value="">Loading...</option>
                ) : (
                  <option value="">Select Financial Instrument</option>
                )}
                {FiData?.map((fi) => (
                  <option
                    key={fi.id}
                    value={fi.id}
                    disabled={
                      selectedFis.includes(fi.id) &&
                      fi.id !== util.financialInstrumentId
                    }
                  >
                    {fi.number}
                  </option>
                ))}
              </select>
            </motion.div>
          </div>

          {/* Utilized Amount Input */}
          <Input
            id={`utilized-${index}`}
            label="Utilized Amount"
            type="number"
            placeholder="Utilized"
            value={util.utilized}
            onChange={(e) => handleAmountChange(index, e.target.value)}
          />
        </motion.div>
      ))}

      {utilizations.length > 0 && (
        <button
          onClick={addNewUtilization}
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
        >
          + Add Another Financial Instrument
        </button>
      )}

      <SaveButton
        handleSubmit={handleFinancialUtilizationSubmit}
        isLoading={mutation.isLoading}
      />
      <button
        onClick={() => setShowFinancialUtilization(false)}
        className=" flex items-center justify-center gap-2 text-black  dark:text-white  bg-transparent hover:border-b-2 transition-all"
      >
        <FaArrowLeft />
        Back to good decalaration
      </button>
    </motion.div>
  );
};

export default FIU;
