"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Swal from "sweetalert2";
import font from "@utils/fonts";
import DataLoader from "@components/Loader/dataLoader";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

export default function ItemSelectionPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const { id } = useParams();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch consignment and set existing goods
  useEffect(() => {
    const fetchConsignmentData = async () => {
      try {
        const response = await fetch(`${apiUrl}/consignment/${id}`);
        if (!response.ok) throw new Error("Failed to fetch consignment data.");
        const data = await response.json();

        if (data.goods && data.goods.length > 0) {
          const existingItemIds = data.goods.map((good) => good.item.id);
          setSelectedItems(existingItemIds);
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message,
        });
      }
    };

    fetchConsignmentData();
  }, [id]);

  // Fetch commodities and existing consignment data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both commodities and consignment data
        const [commodityRes, consignmentRes] = await Promise.all([
          fetch(`${apiUrl}/commodity`),
          fetch(`${apiUrl}/consignment/${id}`),
        ]);

        if (!commodityRes.ok || !consignmentRes.ok) {
          throw new Error("Failed to fetch data.");
        }

        const commodityData = await commodityRes.json();
        const consignmentData = await consignmentRes.json();

        // Get item IDs already in consignment
        const existingItemIds =
          consignmentData.goods?.map((good) => good.item.id) || [];

        // Set all available commodities
        setItems(commodityData);

        // Pre-select items based on consignment data
        setSelectedItems(
          commodityData.filter((item) => existingItemIds.includes(item.id))
        );
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);
  // Handle item selection
  const handleItemSelect = (item) => {
    setSelectedItems((prev) =>
      prev.some((selected) => selected.id === item.id)
        ? prev.filter((selected) => selected.id !== item.id)
        : [...prev, item]
    );
  };

  // Save selected items
  const handleSave = async () => {
    setSubmitLoading(true);
    try {
      // Fetch the current consignment data first
      const currentConsignmentResponse = await fetch(
        `${apiUrl}/consignment/${id}`
      );
      if (!currentConsignmentResponse.ok) {
        throw new Error("Failed to fetch current consignment data.");
      }
      const currentConsignment = await currentConsignmentResponse.json();

      // Post each selected item to /consignmentitem and collect their IDs
      const response = await Promise.all(
        selectedItems.map((item) =>
          fetch(`${apiUrl}/consignmentitem`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              item,
            }),
          }).then((res) => res.json())
        )
      );

      // Extract only IDs from response
      const goods = response.map((item) => ({
        id: item.id,
      }));

      // Merge new goods with existing consignment data
      const updatedConsignment = {
        ...currentConsignment, // Keep existing data
        goods, // Only update goods
      };

      // Update consignment with existing data + new goods
      const consignmentResponse = await fetch(`${apiUrl}/consignment/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedConsignment), // Send the full updated data
      });

      if (!consignmentResponse.ok) {
        throw new Error("Failed to update consignment.");
      }

      Swal.fire({
        position: "top-center",
        icon: "success",
        title: "Saved successfully",
        showConfirmButton: false,
        timer: 1000,
      });

      router.push(`/startconsignment/${id}`);
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

  return (
    <motion.div
      className={`${font.poppins.className} min-h-screen py-8  dark:bg-gray-800 text-LightPText dark:text-DarkPText`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        className="text-3xl font-bold text-center mb-8"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        Select Items
      </motion.h1>

      <motion.div
        className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 space-y-4 capitalize"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl font-semibold mb-4">Available Items</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-8">
          {isLoading ? (
            <div className="col-span-3">
              <DataLoader />
            </div>
          ) : (
            <AnimatePresence>
              {items?.map((item) => (
                <motion.div
                  key={item.id}
                  className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                    selectedItems.some((selected) => selected.id === item.id)
                      ? "border-green-600 bg-green-100 dark:bg-DarkSBg"
                      : "border-gray-300 dark:border-gray-700"
                  }`}
                  onClick={() => handleItemSelect(item)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <p className="text-sm text-LightPText dark:text-DarkPText">
                    Item Number: {item.number}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        <div className="flex justify-between capitalize">
          {!isLoading && (
            <Link
              className="bg-SecondaryButton hover:bg-SecondaryButtonHover transition-all duration-150 text-white px-4 py-2 rounded-md"
              href={"/consignment/commodity/add-commodity"}
            >
              Add New Item
            </Link>
          )}
          <div className="space-x-4">
            <motion.button
              onClick={() => router.push(`/startconsignment/${id}`)}
              className="bg-gray-300 dark:bg-gray-700 text-black dark:text-white px-4 py-2 rounded-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
            <motion.button
              onClick={handleSave}
              className={`bg-PrimaryButton text-white px-4 py-2 rounded-md ${
                submitLoading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-PrimaryButtonHover"
              }`}
              disabled={submitLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {submitLoading ? "Saving..." : "Save"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
