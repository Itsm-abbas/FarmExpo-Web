"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Swal from "sweetalert2";
import font from "@utils/fonts";
import DataLoader from "@components/Loader/dataLoader";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Input from "@components/Input";
import { getCookie } from "cookies-next";
export default function ItemSelectionPage() {
  const token = getCookie("token");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const { id } = useParams();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showQuantityInput, setShowQuantityInput] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [quantity, setQuantity] = useState("");

  // Fetch commodities and consignment data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [commodityRes, consignmentRes] = await Promise.all([
          fetch(`${apiUrl}/commodity`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // Include the token in the Authorization header
            },
          }),
          fetch(`${apiUrl}/consignment/${id}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // Include the token in the Authorization header
            },
          }),
        ]);

        if (!commodityRes.ok || !consignmentRes.ok) {
          throw new Error("Failed to fetch data.");
        }

        const commodityData = await commodityRes.json();
        const consignmentData = await consignmentRes.json();

        const existingItems = consignmentData.goods?.reduce((acc, good) => {
          acc[good.item.id] = { quantity: good.quantity };
          return acc;
        }, {});

        setItems(commodityData);
        setSelectedItems(existingItems || {});
      } catch (error) {
        Swal.fire({ icon: "error", title: "Error", text: error.message });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Handle item selection (show quantity input)
  const handleItemSelect = (item) => {
    setCurrentItem(item);
    setShowQuantityInput(true);
  };

  // Handle quantity submission
  const handleQuantitySubmit = () => {
    if (currentItem) {
      const newItem = { ...currentItem, quantity: quantity || 0 }; // Default quantity 0
      setSelectedItems((prev) => ({
        ...prev,
        [newItem.id]: { quantity: newItem.quantity },
      }));
      setShowQuantityInput(false);
      setQuantity("");
    }
  };

  // Skip quantity input and proceed
  const handleSkip = () => {
    if (currentItem) {
      setSelectedItems((prev) => ({
        ...prev,
        [currentItem.id]: { quantity: 0 },
      }));
      setShowQuantityInput(false);
      setQuantity("");
    }
  };

  // Cancel selection and close input modal
  const handleCancel = () => {
    setShowQuantityInput(false);
    setCurrentItem(null);
    setQuantity("");
  };

  // Save selected items
  const handleSave = async () => {
    setSubmitLoading(true);
    try {
      const response = await Promise.all(
        Object.entries(selectedItems).map(([itemId, { quantity }]) =>
          fetch(`${apiUrl}/consignmentitem`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // Include the token in the Authorization header
            },
            body: JSON.stringify({
              item: { id: parseInt(itemId) },
              quantity: parseFloat(quantity),
            }),
          }).then((res) => res.json())
        )
      );

      const goods = response.map((item) => ({ id: item.id }));

      const consignmentResponse = await fetch(`${apiUrl}/consignment/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
        body: JSON.stringify({ goods }),
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
      Swal.fire({ icon: "error", title: "Error", text: error.message });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <motion.div
      className={`${font.poppins.className} min-h-screen py-8 dark:bg-gray-800 text-LightPText dark:text-DarkPText`}
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
                    selectedItems[item.id]
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

        {/* Quantity Input Modal */}
        {showQuantityInput && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-4">
                Enter Quantity for {currentItem?.name}
              </h3>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Quantity"
              />

              <div className="flex justify-between space-x-2">
                <button
                  onClick={handleSkip}
                  className="bg-gray-300 dark:bg-gray-700 text-black dark:text-white px-4 py-2 rounded-md"
                >
                  Skip for Now
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-red-500 text-white px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleQuantitySubmit}
                  className="bg-PrimaryButton text-white px-4 py-2 rounded-md"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between capitalize">
          {!isLoading && (
            <Link
              className="bg-SecondaryButton hover:bg-SecondaryButtonHover transition-all duration-150 text-white px-4 py-2 rounded-md"
              href={"/consignment/commodity/add-commodity"}
            >
              Add New Item
            </Link>
          )}
          <motion.button
            onClick={handleSave}
            className="bg-PrimaryButton hover:bg-PrimaryButtonHover transition-all text-white px-4 sm:px-6 py-2 rounded-md"
          >
            {submitLoading ? "Saving..." : "Save"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
