"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import Input from "@components/Input";
import SaveButton from "@components/Button/SaveButton";
import LinkButton from "@components/Button/LinkButton";
import { FaEye } from "react-icons/fa";
import { fetchConsignees, fetchTraders } from "@constants/consignmentAPI";
import { useSearchParams } from "next/navigation";
import axiosInstance from "@utils/axiosConfig";

export default function FinancialInstrumentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id"); // Extract the ID from query params
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    number: "",
    trader: "",
    mode: "",
    consignee: "",
    currency: "",
    localDate: "",
    expiryDate: "",
    status: "",
    amount: "",
    balance: "",
    iban: "",
    deliveryTerm: "",
  });

  // Fetch Traders
  const { data: traders = [], isLoading: tradersLoading } = useQuery({
    queryKey: ["traders"],
    queryFn: fetchTraders,
  });

  // Fetch Consignees
  const { data: consignees = [], isLoading: consigneesLoading } = useQuery({
    queryKey: ["consignees"],
    queryFn: fetchConsignees,
  });

  // Mutation for submitting data
  const mutation = useMutation({
    mutationFn: async (newData) => {
      return await axiosInstance.post(`/financialinstrument`, newData);
    },
    onSuccess: async () => {
      const result = await Swal.fire({
        icon: "success",
        title: "Success",
        text: id
          ? "Financial instrument updated successfully."
          : "Financial instrument added successfully.",
      });
      if (result.isConfirmed) {
        router.push("view-financial-instrument");
      }
      if (!id) {
        setFormData({
          number: "",
          trader: "",
          mode: "",
          consignee: "",
          currency: "",
          localDate: "",
          expiryDate: "",
          status: "",
          amount: "",
          balance: "",
          iban: "",
          deliveryTerm: "",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["financialInstruments"] });
    },
    onError: (error) => {
      Swal.fire({ icon: "error", title: "Error", text: error.message });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check for empty fields
    for (const key in formData) {
      if (
        formData[key] === "" || // Check empty string
        formData[key] === null || // Check null values
        formData[key] === undefined // Check undefined values
      ) {
        Swal.fire({
          icon: "warning",
          title: "Missing Information",
          text: `Please fill in the ${key} field.`,
        });
        return; // Stop the submission
      }
    }

    // If all fields are filled, proceed with mutation
    mutation.mutate(formData);
  };

  const HandleChangeConsignee = (e) => {
    const selectedId = e.target.value;
    const c = consignees.find((t) => t.id === parseInt(selectedId));
    setFormData({ ...formData, consignee: c });
  };
  const HandleTraderChange = (e) => {
    const selectedId = e.target.value;
    const t = traders.find((t) => t.id === parseInt(selectedId));
    setFormData({ ...formData, trader: t });
  };
  useEffect(() => {
    if (id) {
      const fetchFI = async () => {
        try {
          const response = await axiosInstance.get(
            `/financialinstrument/${id}`
          );
          const { data } = response;
          setFormData(data);
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to fetch FI details.",
          });
        }
      };
      fetchFI();
    }
  }, [id]);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="space-y-4 text-LightPText dark:text-DarkPText w-full md:w-4/5 lg:w-1/2"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="shadow-md rounded-md p-6 space-y-4 border-LightBorder dark:border-DarkBorder border-2"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          Financial Instrument
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            id="number"
            placeholder="Number"
            value={formData.number}
            onChange={(e) =>
              setFormData({ ...formData, number: e.target.value })
            }
          />

          {/* Trader Dropdown */}
          <motion.select
            className="w-full p-2 border rounded-md  dark:bg-DarkSBg dark:text-white"
            value={formData.trader.id || ""}
            onChange={HandleTraderChange}
          >
            <option value="">
              {tradersLoading ? "Loading..." : "Select Trader"}
            </option>
            {traders.map((trader) => (
              <option key={trader.id} value={trader.id}>
                {trader.name}
              </option>
            ))}
          </motion.select>

          <Input
            id="mode"
            placeholder="Mode"
            value={formData.mode}
            onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
          />

          {/* Consignee Dropdown */}
          <motion.select
            className="w-full p-2 border rounded-md  dark:bg-DarkSBg dark:text-white"
            value={formData.consignee.id || ""}
            onChange={HandleChangeConsignee}
          >
            <option value="">
              {consigneesLoading ? "Loading..." : "Select Consignee"}
            </option>
            {consignees.map((consignee) => (
              <option key={consignee.id} value={consignee.id}>
                {consignee.name}
              </option>
            ))}
          </motion.select>

          <Input
            id="currency"
            placeholder="Currency"
            value={formData.currency}
            onChange={(e) =>
              setFormData({ ...formData, currency: e.target.value })
            }
          />
          <Input
            id="localDate"
            type="date"
            placeholder="Local Date"
            value={formData.localDate}
            onChange={(e) =>
              setFormData({ ...formData, localDate: e.target.value })
            }
          />
          <Input
            id="expiryDate"
            type="date"
            placeholder="Expiry Date"
            value={formData.expiryDate}
            onChange={(e) =>
              setFormData({ ...formData, expiryDate: e.target.value })
            }
          />
          <Input
            id="status"
            placeholder="Status"
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
          />
          <Input
            id="amount"
            type="number"
            placeholder="Amount"
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: e.target.value })
            }
          />
          <Input
            id="balance"
            type="number"
            placeholder="Balance"
            value={formData.balance}
            onChange={(e) =>
              setFormData({ ...formData, balance: e.target.value })
            }
          />
          <Input
            id="iban"
            placeholder="IBAN"
            value={formData.iban}
            onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
          />
          <Input
            id="deliveryTerm"
            placeholder="Delivery Term"
            value={formData.deliveryTerm}
            onChange={(e) =>
              setFormData({ ...formData, deliveryTerm: e.target.value })
            }
          />

          <motion.div whileHover={{ scale: 1.02 }}>
            <SaveButton
              handleSubmit={handleSubmit}
              isLoading={mutation.isLoading}
            />
          </motion.div>
        </form>
      </motion.div>

      <motion.div whileHover={{ scale: 1.02 }}>
        <LinkButton
          href="/consignment/view-financial-instrument"
          title="See your financial instruments"
          icon={FaEye}
          desc="Click to view your existing financial instrument"
        />
      </motion.div>
    </motion.div>
  );
}
