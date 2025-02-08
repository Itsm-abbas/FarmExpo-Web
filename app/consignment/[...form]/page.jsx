"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Import your components
import CommodityForm from "@forms/Commodity";
import PackerForm from "@forms/Packer";
import CustomAgentForm from "@forms/CustomAgent";
import IATAAgentForm from "@forms/IataAgent";
import PackagingForm from "@components/Forms/Packaging";
import TraderForm from "@forms/Trader";
import ViewCommodity from "@components/ViewData/Commodity";
import ViewTrader from "@components/ViewData/Trader";
import ViewPacker from "@components/ViewData/Packer";
import IataAgent from "@forms/IataAgent";
import ViewIataAgent from "@components/ViewData/IataAgent";
import CustomAgent from "@forms/CustomAgent";
import ViewCustomAgent from "@components/ViewData/CustomAgent";
import Packaging from "@components/Forms/Packaging";
import ViewPackaging from "@components/ViewData/Packaging";
import ConsignmentItemForm from "@components/Forms/Consignmentitem";
import ConsigneeForm from "@components/Forms/Consignee";
import ViewConsignee from "@components/ViewData/Consignee";
import ViewConsignmentItem from "@components/ViewData/ConsignmentItem";
import { FaArrowLeft } from "react-icons/fa";
import AllConsignments from "@components/ViewData/AllConsignments";
// Add other imports here...

export default function DynamicConsignmentPage() {
  const params = useParams();
  const [FormComponent, setFormComponent] = useState(null);
  const router = useRouter();
  // Component mapping
  const componentMap = {
    "consignee/add-consignee": ConsigneeForm,
    "consignee/view-consignee": ViewConsignee,
    "commodity/add-commodity": CommodityForm,
    "commodity/view-commodity": ViewCommodity,
    "packer/add-packer": PackerForm,
    "packer/view-packer": ViewPacker,
    "iata-agent/add-iataAgent": IataAgent,
    "iata-agent/view-iataAgent": ViewIataAgent,
    "custom-agent/add-customAgent": CustomAgent,
    "custom-agent/view-customAgent": ViewCustomAgent,
    "packaging/add-packaging": PackagingForm,
    "packaging/view-packaging": ViewPackaging,
    "trader/add-trader": TraderForm,
    "trader/view-trader": ViewTrader,
    "consignmentitem/add-consignmentitem": ConsignmentItemForm,
    "consignmentitem/view-consignmentitem": ViewConsignmentItem,
    "all-consignments": AllConsignments,

    // Add other mappings here...
  };

  useEffect(() => {
    if (params && params.form) {
      const dynamicPath = params.form.join("/"); // Convert segments to a path
      if (componentMap[dynamicPath]) {
        setFormComponent(() => componentMap[dynamicPath]);
      } else {
        setFormComponent(() => () => <p>404 - Component Not Found</p>);
      }
    }
  }, [params]);

  return (
    <div className="relative w-full h-full flex flex-col justify-center items-center py-20">
      <div className="absolute top-5 left-0 sm:left-10 md:left-28 lg:left-40">
        <button
          onClick={() => router.back()}
          className=" flex justify-center items-center gap-2 bg-trasparent  px-4 py-2 rounded-md border border-LightBorder dark:border-DarkBorder hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
        >
          <FaArrowLeft /> Back
        </button>
      </div>
      {FormComponent && <FormComponent />}
    </div>
  );
}
