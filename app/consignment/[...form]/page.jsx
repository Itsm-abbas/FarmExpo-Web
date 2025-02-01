"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

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
// Add other imports here...

export default function DynamicConsignmentPage() {
  const params = useParams();
  const [FormComponent, setFormComponent] = useState(null);

  // Component mapping
  const componentMap = {
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
    consignmentitem: ConsignmentItemForm,
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
    <div className="w-full h-full flex justify-center items-center py-20">
      {FormComponent && <FormComponent />}
    </div>
  );
}
