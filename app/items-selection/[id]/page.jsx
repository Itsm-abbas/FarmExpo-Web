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
import PackagingForm from "@components/Forms/StartConsignment/Packaging";
import { FaArrowRight } from "react-icons/fa";

export default function ItemSelectionPage() {
  const router = useRouter();
  const token = getCookie("token");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [showDetailInput, setshowDetailInput] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [itemDetail, setItemDetail] = useState({
    qty: "",
    weightPerUnit: "",
    commodityPerUnitCost: "",
    packagingPerUnitCost: "",
    packaging: null,
  });
  const [packagingOptions, setPackagingOptions] = useState([]);

  // Fetch packaging data
  useEffect(() => {
    const fetchPackaging = async () => {
      try {
        const response = await fetch(`${apiUrl}/packaging`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch packaging data.");
        }

        const data = await response.json();
        setPackagingOptions(data);
      } catch (error) {
        console.error("Error fetching packaging data:", error);
      }
    };

    fetchPackaging();
  }, []);
  // Fetch commodities and consignment data
  useEffect(() => {
    const fetchCommodities = async () => {
      const response = await fetch(`${apiUrl}/commodity`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch commodities.");
      }

      return await response.json();
    };

    const fetchConsignment = async () => {
      const response = await fetch(`${apiUrl}/consignment/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch consignment data.");
      }

      return await response.json();
    };

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [commodityData, consignmentData] = await Promise.all([
          fetchCommodities(),
          fetchConsignment(),
        ]);

        // Map existing items with all details
        const existingItems = consignmentData.goods?.reduce((acc, good) => {
          acc[good.item.id] = {
            quantity: good.quantity,
            weightPerUnit: good.weightPerUnit,
            commodityPerUnitCost: good.commodityPerUnitCost,
            packagingPerUnitCost: good.packagingPerUnitCost,
            packaging: good.packaging,
            damage: good.damage,
          };
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
  // Handle item deselection and removal from consignment
  const handleDeselectItem = async (item) => {
    try {
      // 1. Fetch the current consignment data
      const consignmentRes = await fetch(`${apiUrl}/consignment/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!consignmentRes.ok) throw new Error("Failed to fetch consignment");
      const consignmentData = await consignmentRes.json();

      // 2. Find the consignment item to remove
      const itemToRemove = consignmentData.goods?.find(
        (g) => g.item.id === item.id
      );

      if (itemToRemove) {
        // 3. First remove the item from consignment's goods array
        const updatedGoods = consignmentData.goods?.filter(
          (g) => g.item.id !== item.id
        );

        const updatedConsignment = {
          ...consignmentData,
          goods: updatedGoods,
        };

        // 4. Update the consignment on the server (remove from /consignment first)
        const consignmentUpdateRes = await fetch(
          `${apiUrl}/consignment/${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updatedConsignment),
          }
        );

        if (!consignmentUpdateRes.ok)
          throw new Error("Failed to update consignment");

        // 5. Now delete the consignment item from /consignmentitem
        const deleteResponse = await fetch(
          `${apiUrl}/consignmentitem/${itemToRemove.id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!deleteResponse.ok) throw new Error("Failed to delete item");
      }

      // 6. Update local state
      setSelectedItems((prev) => {
        const updatedItems = { ...prev };
        delete updatedItems[item.id];
        return updatedItems;
      });

      Swal.fire({
        position: "top-center",
        icon: "success",
        title: "Item removed!",
        showConfirmButton: false,
        timer: 1000,
      });
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: error.message });
    }
  };
  // Updated handleItemSelect function with deselection
  const handleItemSelect = (item) => {
    if (selectedItems[item.id]) {
      Swal.fire({
        title: "Item Already Selected",
        text: "Do you want to edit this item's details or remove it completely?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Edit Details",
        cancelButtonText: "Remove Item",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          setCurrentItem(item);
          setshowDetailInput(true);
          setItemDetail({
            qty: selectedItems[item.id].quantity || "",
            weightPerUnit: selectedItems[item.id].weightPerUnit || "",
            commodityPerUnitCost:
              selectedItems[item.id].commodityPerUnitCost || "",
            packagingPerUnitCost:
              selectedItems[item.id].packagingPerUnitCost || "",
            packaging: selectedItems[item.id].packaging || null,
          });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          handleDeselectItem(item); // Call the new deselection function
        }
      });
    } else {
      setCurrentItem(item);
      setshowDetailInput(true);
      setItemDetail({
        qty: "",
        weightPerUnit: "",
        commodityPerUnitCost: "",
        packagingPerUnitCost: "",
        packaging: null,
      });
    }
  };

  // Handle quantity submission
  const handleItemDetail = async () => {
    if (currentItem) {
      setSubmitLoading(true);
      try {
        // 1. Prepare the item data
        const itemData = {
          item: { id: currentItem.id },
          quantity: parseFloat(itemDetail.qty) || 0,
          weightPerUnit: parseFloat(itemDetail.weightPerUnit) || 0,
          commodityPerUnitCost:
            parseFloat(itemDetail.commodityPerUnitCost) || 0,
          packagingPerUnitCost:
            parseFloat(itemDetail.packagingPerUnitCost) || 0,
          packaging: itemDetail.packaging,
          damage: selectedItems[currentItem.id]?.damage || 0,
        };

        // 2. Check if item exists in consignment
        const consignmentRes = await fetch(`${apiUrl}/consignment/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!consignmentRes.ok) throw new Error("Failed to fetch consignment");
        const consignmentData = await consignmentRes.json();

        const existingItem = consignmentData.goods?.find(
          (g) => g.item.id === currentItem.id
        );
        const method = existingItem ? "PUT" : "POST";
        const url = existingItem
          ? `${apiUrl}/consignmentitem/${existingItem.id}`
          : `${apiUrl}/consignmentitem`;

        // 3. Save the consignment item
        const itemResponse = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(itemData),
        });

        if (!itemResponse.ok) throw new Error("Failed to save item");
        const savedItem = await itemResponse.json();

        // 4. Update the consignment's goods array
        let updatedGoods = [...(consignmentData.goods || [])];

        if (existingItem) {
          updatedGoods = updatedGoods.map((g) =>
            g.item.id === currentItem.id ? { ...g, ...savedItem } : g
          );
        } else {
          updatedGoods.push(savedItem);
        }

        const updatedConsignment = {
          ...consignmentData,
          goods: updatedGoods,
        };

        const consignmentUpdateRes = await fetch(
          `${apiUrl}/consignment/${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updatedConsignment),
          }
        );

        if (!consignmentUpdateRes.ok)
          throw new Error("Failed to update consignment");

        // 5. Update local state
        setSelectedItems((prev) => ({
          ...prev,
          [currentItem.id]: {
            ...itemData,
            id: savedItem.id, // Include the ID from the response
          },
        }));

        Swal.fire({
          position: "top-center",
          icon: "success",
          title: "Item saved!",
          showConfirmButton: false,
          timer: 1000,
        });

        setshowDetailInput(false);
      } catch (error) {
        Swal.fire({ icon: "error", title: "Error", text: error.message });
      } finally {
        setSubmitLoading(false);
      }
    }
  };
  // Skip quantity input and proceed
  const handleSkip = () => {
    if (currentItem) {
      // Add the item with default values (all fields are empty or 0)
      setSelectedItems((prev) => ({
        ...prev,
        [currentItem.id]: {
          quantity: 0,
          weightPerUnit: 0,
          commodityPerUnitCost: 0,
          packagingPerUnitCost: 0,
          packaging: null,
        },
      }));

      // Close the detail input modal and reset the form
      setshowDetailInput(false);
      setItemDetail({
        qty: "",
        weightPerUnit: "",
        commodityPerUnitCost: "",
        packagingPerUnitCost: "",
        packaging: null,
      });
    }
  };

  // Cancel selection and close input modal
  const handleCancel = () => {
    // Close the detail input modal and reset the form
    setshowDetailInput(false);
    setItemDetail({
      qty: "",
      weightPerUnit: "",
      commodityPerUnitCost: "",
      packagingPerUnitCost: "",
      packaging: null,
    });
  };

  // Save selected items
  const handleSave = () => {
    router.push(`/startconsignment/${id}`);
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

        {/* Detail Input Modal */}
        {showDetailInput && (
          <motion.div
            className="fixed inset-0 h-full bg-black bg-opacity-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 w-full md:w-2/5 p-6 rounded-lg shadow-lg flex flex-col max-h-[90vh]"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <div className="flex-1 overflow-y-auto pr-2">
                <h3 className="text-lg font-semibold mb-4">
                  Enter Detail for {currentItem?.name}
                </h3>
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200">
                  <p className="font-medium">✏️ Flexible Data Entry</p>
                  <p>Fill in what you have now; update the remaining later!</p>
                </div>
                <Input
                  type="number"
                  value={itemDetail.qty}
                  onChange={(e) =>
                    setItemDetail((prev) => ({ ...prev, qty: e.target.value }))
                  }
                  placeholder="Quantity"
                />
                <Input
                  classes="mt-5"
                  type="number"
                  value={itemDetail.weightPerUnit}
                  onChange={(e) =>
                    setItemDetail((prev) => ({
                      ...prev,
                      weightPerUnit: e.target.value,
                    }))
                  }
                  placeholder="Weight Per Unit"
                />
                <Input
                  classes="mt-5"
                  type="number"
                  value={itemDetail.commodityPerUnitCost}
                  onChange={(e) =>
                    setItemDetail((prev) => ({
                      ...prev,
                      commodityPerUnitCost: e.target.value,
                    }))
                  }
                  placeholder="Per Unit Cost"
                />
                <Input
                  classes="mt-5"
                  type="number"
                  value={itemDetail.packagingPerUnitCost}
                  onChange={(e) =>
                    setItemDetail((prev) => ({
                      ...prev,
                      packagingPerUnitCost: e.target.value,
                    }))
                  }
                  placeholder="Packaging Per Unit Cost"
                />

                {/* Packaging Dropdown */}
                <div className="mt-5">
                  <select
                    value={itemDetail.packaging?.id || ""}
                    onChange={(e) => {
                      if (e.target.value === "add-new-packaging") {
                        router.push("/consignment/packaging/add-packaging");
                      }
                      const selectedPackaging = packagingOptions.find(
                        (pkg) => pkg.id === parseInt(e.target.value)
                      );
                      setItemDetail((prev) => ({
                        ...prev,
                        packaging: selectedPackaging,
                      }));
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 outline-none"
                  >
                    <option value="">Select Packaging</option>
                    {packagingOptions.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} {pkg.packagingweightPerUnit}
                      </option>
                    ))}
                    <option
                      value="add-new-packaging"
                      className="text-green-600 capitalize font-semibold cursor-pointer"
                    >
                      + Add New Packaging
                    </option>
                  </select>
                </div>
                {/* Note Section */}
              </div>

              {/* Buttons Section - Always Visible */}
              <div className="flex justify-end space-x-2 mt-4 pt-4 border-t dark:border-gray-700">
                {/* <button
                  onClick={handleSkip}
                  className="bg-gray-300 dark:bg-gray-700 text-black dark:text-white px-4 py-2 rounded-md"
                >
                  Skip for Now
                </button> */}
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className="bg-CancelButton hover:bg-CancelButtonHover text-white px-4 py-2 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleItemDetail}
                    className="bg-PrimaryButton hover:bg-PrimaryButtonHover transition text-white px-4 py-2 rounded-md"
                    disabled={submitLoading}
                  >
                    {submitLoading ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
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
          <div className="flex gap-4">
            {/* <motion.button
              onClick={() => router.back()}
              className="bg-CancelButton hover:bg-CancelButtonHover transition-all text-white px-4 sm:px-6 py-2 rounded-md"
            >
              Cancel
            </motion.button> */}
            <motion.button
              onClick={handleSave}
              className="bg-PrimaryButton flex items-center gap-2 hover:bg-PrimaryButtonHover transition-all text-white px-4 sm:px-6 py-2 rounded-md"
            >
              Continue <FaArrowRight />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
