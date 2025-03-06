"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import ConsigneeForm from "@components/Forms/StartConsignment/Consignee";
import TraderForm from "@components/Forms/StartConsignment/Trader";
import AirwayBill from "@components/Forms/StartConsignment/AirwayBill";
import CustomClearence from "@forms/StartConsignment/CustomClearance";
import Packing from "@components/Forms/StartConsignment/Packing";
import RecoveryDoneForm from "@components/Forms/StartConsignment/RecoveryDone";
import {
  FaArrowRight,
  FaCheck,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import GoodsDeclarationForm from "@forms/StartConsignment/GoodsDeclaration";
import Swal from "sweetalert2";
import font from "@utils/fonts";
import Link from "next/link";
import DamageForm from "@components/Forms/StartConsignment/Damage";
import { motion, AnimatePresence } from "framer-motion";
import PackagingForm from "@components/Forms/StartConsignment/Packaging";
import DataLoader from "@components/Loader/dataLoader";
import LinkButton from "@components/Button/LinkButton";
import axiosInstance from "@utils/axiosConfig";

const formsData = [
  { id: 1, name: "Consignee", component: ConsigneeForm, key: "consignee" },
  { id: 2, name: "Trader", component: TraderForm, key: "trader" },
  { id: 3, name: "Airway Bill", component: AirwayBill, key: "airwayBill" },
  {
    id: 4,
    name: "Goods Declaration",
    component: GoodsDeclarationForm,
    key: "goodsDeclaration",
  },
  {
    id: 5,
    name: "Custom Clearance",
    component: CustomClearence,
    key: "customClearance",
  },
  { id: 6, name: "Packing", component: Packing, key: "packing" },
  {
    id: 9,
    name: "Packaging",
    component: PackagingForm,
    key: "goods/packaging",
  },
  {
    id: 7,
    name: "Recovery",
    component: RecoveryDoneForm,
    key: "recoveryDone",
  },
  {
    id: 8,
    name: "Damage",
    component: DamageForm,
    key: "goods/damage",
  },
];

export default function StartConsignmentPage() {
  const params = useParams();
  const consignmentId = params.id;
  const [formStatuses, setFormStatuses] = useState({});
  const [activeAccordion, setActiveAccordion] = useState(null);
  const accordionRefs = useRef({}); // Store refs for each accordion
  const [itemsLength, setItemsLength] = useState(0);
  const fetchFormStatuses = async () => {
    try {
      const response = await axiosInstance.get(`/consignment/${consignmentId}`);
      const { data } = response;
      setFormStatuses(data);
      setItemsLength(data.goods.length);
    } catch (error) {
      console.error("Error fetching statuses:", error);
    }
  };

  useEffect(() => {
    fetchFormStatuses();
  }, []);

  const toggleAccordion = (id) => {
    setActiveAccordion(activeAccordion === id ? null : id);

    // Scroll the accordion into view
    setTimeout(() => {
      accordionRefs.current[id]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 300); // Delay allows animation to start before scrolling
  };

  return (
    <div
      className={`${font.lato.className} min-h-screen dark:bg-gray-800 text-LightPText dark:text-DarkPText py-8`}
    >
      <h1 className="text-3xl font-bold text-center mb-8">
        Create Consignment
      </h1>

      <div className="flex flex-col gap-5">
        <div className="flex justify-center">
          {/* Consignment items */}
          <Link href={`/items-selection/${consignmentId}`}>
            <button
              className={`px-6 py-3 rounded-lg text-white capitalize font-medium transition-all duration-300 ${
                itemsLength > 0
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-SecondaryButton hover:bg-SecondaryButtonHover"
              }`}
            >
              {itemsLength > 0
                ? "Click to update consignment items"
                : "Click to add consignment items"}
            </button>
          </Link>
        </div>
        {/* Accordion */}
        {formsData.map((form) => {
          const FormComponent = form.component;
          // const isSubmitted = formStatuses[form.key];
          const isSubmitted =
            form.key === "goods/packaging"
              ? formStatuses.goods?.some((item) => item?.packaging)
              : form.key === "goods/damage"
              ? formStatuses.goods?.some((item) => item?.damage)
              : formStatuses[form.key];
          return (
            <div
              key={form.id}
              ref={(el) => (accordionRefs.current[form.id] = el)} // Assign ref for scrolling
              className="rounded-lg"
            >
              <div
                className={`rounded-lg p-4 cursor-pointer flex justify-between items-center ${
                  isSubmitted
                    ? "bg-[#D1FAE5] text-[#065F46] border-[#10B981] border-2"
                    : activeAccordion === form.id
                    ? "bg-gray-300 dark:bg-gray-700"
                    : "bg-gray-200 dark:bg-gray-600"
                }`}
                onClick={() => toggleAccordion(form.id)}
              >
                <h2 className="text-lg flex items-center">
                  {isSubmitted ? (
                    <>
                      <span className="line-through mr-4 text-sm text-gray-600">
                        Add {form.name}
                      </span>
                      <span className="text-xl">Submitted</span>
                    </>
                  ) : (
                    <p>Add {form.name}</p>
                  )}
                  <span className="ml-2">{isSubmitted && <FaCheck />}</span>
                </h2>
                <span className="text-sm">
                  {activeAccordion === form.id ? (
                    <div className="flex gap-1 items-center">
                      <span>Minimize</span>
                      <FaChevronUp />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span>{isSubmitted ? "Click to Edit" : "Expand"}</span>
                      <FaChevronDown />
                    </div>
                  )}
                </span>
              </div>
              <AnimatePresence>
                {activeAccordion === form.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-4 bg-white dark:bg-[#2d3748] text-[#e5e7eb] flex items-center justify-center overflow-hidden"
                  >
                    <FormComponent
                      consignmentId={consignmentId}
                      existingData={isSubmitted || null}
                      setFormStatuses={setFormStatuses}
                      setActiveAccordion={setActiveAccordion}
                      formStatus={formStatuses}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
        <div className="flex justify-end mt-4">
          <Link href={`/invoice/${consignmentId}`}>
            <button className="px-4 py-2 flex items-center gap-2 bg-purple-600 text-white font-semibold rounded-sm shadow-md hover:bg-purple-700 transition">
              Generate Invoice <FaArrowRight />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
