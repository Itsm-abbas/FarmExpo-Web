"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import SaveButton from "@components/Button/SaveButton";
import Input from "@components/Input";
import UpdateConsignment from "@utils/updateConsignment";
const MySwal = withReactContent(Swal);

export default function RecoveryDoneForm({
  consignmentId,
  existingData,
  setFormStatuses,
  setActiveAccordion,
}) {
  const [formData, setFormData] = useState({
    amount: "",
    currency: "",
    exchangeRate: "",
  });
  const [isLoading, setIsLoading] = useState(false); // Loader state

  const handleSubmit = async () => {
    if (!formData.amount || !formData.currency || !formData.exchangeRate) {
      MySwal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please fill in all the fields.",
      });
      return;
    }
    if (existingData) {
      if (
        formData.ntn === existingData.ntn &&
        formData.name === existingData.name &&
        formData.address === existingData.address &&
        formData.country === existingData.country
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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/recovery-done`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      const { id } = await response.json();

      if (existingData) {
        await UpdateConsignment(consignmentId, {
          recoveryDone: { id, ...formData },
        });
      } else {
        await UpdateConsignment(
          consignmentId,
          { recoveryDone: { id, ...formData } },
          "Completed"
        );
      }
      setFormStatuses((prev) => ({
        ...prev,
        recoveryDone: { id, ...formData },
      }));
      setActiveAccordion(null);
      if (!response.ok) {
        throw new Error("Failed to save data: Check your internet");
      }
      MySwal.fire({
        icon: "success",
        title: "Success",
        text: "Recovery added successfully!",
      });
      setFormData({ amount: "", currency: "", exchangeRate: "" }); // Clear form
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
  useEffect(() => {
    if (existingData) {
      setFormData(existingData); // Pre-fill the form with existing data
    }
  }, [existingData]);
  return (
    <div className="space-y-4 text-LightPText dark:text-DarkPText w-full md:w-4/5 lg:w-1/2">
      <div className=" shadow-md rounded-md p-6 space-y-4 border-LightBorder dark:border-DarkBorder border-2">
        <div>
          <h2 className="text-xl font-semibold mb-8">Recovery</h2>

          <Input
            id="amount"
            label="Amount"
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: e.target.value })
            }
            placeholder="Enter amount"
          />
          <Input
            id="currency"
            label="Currency"
            value={formData.currency}
            onChange={(e) =>
              setFormData({ ...formData, currency: e.target.value })
            }
            placeholder="Enter currency"
          />
          <Input
            id="exchangeRate"
            label="Exchange Rate"
            value={formData.exchangeRate}
            onChange={(e) =>
              setFormData({ ...formData, exchangeRate: e.target.value })
            }
            placeholder="Enter exchange rate"
          />
        </div>

        <SaveButton
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          existingData={existingData}
          classes=""
        />
      </div>
    </div>
  );
}
