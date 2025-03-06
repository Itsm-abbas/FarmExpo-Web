"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import moment from "moment";
import fonts from "@utils/fonts";
import * as XLSX from "xlsx";
import axiosInstance from "@utils/axiosConfig";
const Invoice = () => {
  const params = useParams();
  const consignmentId = params.id;
  const [consignment, setConsignment] = useState(null);
  const [loading, setLoading] = useState(true);
  // To excel
  const exportToExcel = () => {
    if (!consignment) return;

    const invoiceData = [
      ["Consignment ID", consignment.id],
      ["Date", new Date(consignment.date).toLocaleDateString()],
      [],
      ["Trader Details"],
      ["Name", consignment.trader.name],
      ["Address", consignment.trader.address],
      ["Country", consignment.trader.country],
      ["NTN", consignment.trader.ntn],
      [],
      ["Consignee Details"],
      ["Name", consignment.consignee.name],
      ["Address", consignment.consignee.address],
      ["Country", consignment.consignee.country],
      [],
      ["Goods"],
      [
        "Item",
        "Quantity",
        "Weight (kg)",
        "Packaging",
        "Commodity Cost",
        "Packaging Cost",
        "Damage",
        "Total",
      ],
      ...consignment.goods.map((good) => [
        good.item.name,
        good.quantity,
        good.weightPerUnit,
        good.packaging.name,
        good.commodityPerUnitCost,
        good.packagingPerUnitCost,
        good.damage,
        (
          good.commodityPerUnitCost * good.quantity +
          good.packagingPerUnitCost * good.quantity
        ).toFixed(2),
      ]),
      [],
      ["Total Weight", consignment.localInvoiceWeight + " kg"],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(invoiceData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Invoice");

    XLSX.writeFile(workbook, `invoice_consignment_${consignment.id}.xlsx`);
  };
  // Fetch consignment data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(
          `/consignment/${consignmentId}`
        );
        const { data } = response;
        setConsignment(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [consignmentId]);

  // Generate PDF
  const generatePDF = async () => {
    const element = document.getElementById("invoice");
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2 });
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      10,
      10,
      imgWidth,
      imgHeight
    );
    pdf.save(`invoice_consignment_${consignmentId}.pdf`);
  };

  // Trigger print dialog
  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        ></motion.div>
      </div>
    );
  }

  if (!consignment) {
    return (
      <div
        className={` text-center text-red-500 mt-10 bg-gray-100 dark:bg-gray-900 dark:text-red-400`}
      >
        Failed to load invoice data.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`p-4 bg-gray-100 dark:bg-gray-900 min-h-screen  ${fonts.openSans.className}`}
    >
      <div
        id="invoice"
        className="print-area bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 max-w-4xl mx-auto text-sm"
      >
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            FarmExpo - Invoice
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Consignment ID: {consignment.id}
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            Date: {new Date(consignment.date).toLocaleDateString()}
          </p>
        </div>

        {/* Trader & Consignee Table */}
        <table className="w-full mb-4">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700">
              <th className="p-2 text-left">Trader Details</th>
              <th className="p-2 text-left">Consignee Details</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border-r border-gray-200 dark:border-gray-700">
                <p>
                  <strong>Name:</strong> {consignment.trader.name}
                </p>
                <p>
                  <strong>Address:</strong> {consignment.trader.address}
                </p>
                <p>
                  <strong>Country:</strong> {consignment.trader.country}
                </p>
                <p>
                  <strong>NTN:</strong> {consignment.trader.ntn}
                </p>
              </td>
              <td className="p-2">
                <p>
                  <strong>Name:</strong> {consignment.consignee.name}
                </p>
                <p>
                  <strong>Address:</strong> {consignment.consignee.address}
                </p>
                <p>
                  <strong>Country:</strong> {consignment.consignee.country}
                </p>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Airway Bill & Goods Declaration Table */}
        <table className="w-full mb-4">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700">
              <th className="p-2 text-left">Airway Bill</th>
              <th className="p-2 text-left">Goods Declaration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border-r border-gray-200 dark:border-gray-700">
                <p>
                  <strong>Number:</strong> {consignment.airwayBill.number}
                </p>
                <p>
                  <strong>Agent:</strong>{" "}
                  {consignment.airwayBill.iataAgent.name}
                </p>
                <p>
                  <strong>Station:</strong>{" "}
                  {consignment.airwayBill.iataAgent.station}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(consignment.airwayBill.dateTime).toLocaleString()}
                </p>
                <p>
                  <strong>Rate:</strong> {consignment.airwayBill.rate}
                </p>
                <p>
                  <strong>Weight:</strong>{" "}
                  {consignment.airwayBill.airwayBillWeight} kg
                </p>
                <p>
                  <strong>Fee:</strong> {consignment.airwayBill.fee}
                </p>
              </td>
              <td className="p-2">
                <p>
                  <strong>Number:</strong> {consignment.goodsDeclaration.number}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(
                    consignment.goodsDeclaration.date
                  ).toLocaleDateString()}
                </p>
                <p>
                  <strong>Exchange Rate:</strong>{" "}
                  {consignment.goodsDeclaration.exchangeRate}
                </p>
                <p>
                  <strong>Invoice No:</strong>{" "}
                  {consignment.goodsDeclaration.commercialInvoiceNumber}
                </p>
                <p>
                  <strong>FOB:</strong> {consignment.goodsDeclaration.fob}
                </p>
                <p>
                  <strong>GD Freight:</strong>
                  {consignment.goodsDeclaration.gdFreight}
                </p>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Custom Clearance & Packing Table */}
        <table className="w-full mb-4">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700">
              <th className="p-2 text-left">Custom Clearance</th>
              <th className="p-2 text-left">Packing</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border-r border-gray-200 dark:border-gray-700">
                <p>
                  <strong>Custom Agent Name:</strong>{" "}
                  {consignment.customClearance.ca.name}
                </p>
                <p>
                  <strong>Custom Agent Station:</strong>{" "}
                  {consignment.customClearance.ca.station}
                </p>
                <p>
                  <strong>Fee:</strong> {consignment.customClearance.fee}
                </p>
              </td>
              <td className="p-2">
                <p>
                  <strong>Packer:</strong> {consignment.packing.packer.name}
                </p>
                <p>
                  <strong>Station:</strong> {consignment.packing.packer.station}
                </p>
                <p>
                  <strong>Rate per Kg:</strong> {consignment.packing.ratePerKg}
                </p>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Goods Table */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Goods
          </h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700">
                <th className="p-1 text-left">Item</th>
                <th className="p-1 text-left">Qty</th>
                <th className="p-1 text-left">Total Weight</th>
                <th className="p-1 text-left">Packaging</th>
                <th className="p-1 text-left">Total Commodity Cost</th>
                <th className="p-1 text-left">Total Packaging Cost</th>
                <th className="p-1 text-left">Damage</th>
                <th className="p-1 text-left">Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {consignment.goods.map((good, index) => {
                const totalWeight = good.weightPerUnit * good.quantity;
                const totalCommodityCost =
                  good.commodityPerUnitCost * good.quantity;
                const totalPackagingCost =
                  good.packagingPerUnitCost * good.quantity;
                const totalCost = totalCommodityCost + totalPackagingCost;

                return (
                  <tr
                    key={index}
                    className="border-b border-gray-200 dark:border-gray-700"
                  >
                    <td className="p-1">{good.item.name}</td>
                    <td className="p-1">{good.quantity}</td>
                    <td className="p-1">{totalWeight.toFixed(1)} kg</td>
                    <td className="p-1">{good.packaging.name}</td>
                    <td className="p-1">{totalCommodityCost}</td>
                    <td className="p-1">{totalPackagingCost}</td>
                    <td className="p-1">{good.damage.toFixed(2)}</td>
                    <td className="p-1 font-bold">{totalCost.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals & Recovery */}
        <table className="w-full mb-4">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700">
              <th className="p-2 text-left">Totals</th>
              <th className="p-2 text-left">Recovery</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border-r border-gray-200 dark:border-gray-700">
                <p>
                  <strong>Total Weight:</strong>{" "}
                  {consignment.localInvoiceWeight} kg
                </p>
                <p>
                  <strong>Daily Expenses:</strong> {consignment.dailyExpenses}
                </p>
                <p>
                  <strong>Status:</strong> {consignment.status}
                </p>
              </td>
              <td className="p-2">
                <p>
                  <strong>Amount:</strong> {consignment.recoveryDone.amount}
                </p>
                <p>
                  <strong>Currency:</strong> {consignment.recoveryDone.currency}
                </p>
                <p>
                  <strong>Exchange Rate:</strong>{" "}
                  {consignment.recoveryDone.exchangeRate}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="bg-gray-100 text-xs dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-md shadow-md font-medium inline-block">
          🧾 Invoice generated on:
          <span className="ml-2  font-semibold text-blue-600 dark:text-blue-400">
            {moment().format("MMMM Do YYYY, h:mm:ss a")}
          </span>
        </div>
      </div>

      {/* Buttons */}
      <div className="fixed bottom-6 right-6 flex gap-4 print:hidden">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={exportToExcel}
          className="bg-[#217346] text-white px-4 py-2 rounded-lg shadow hover:bg-[#1A5A36] transition"
        >
          Export to Excel
        </motion.button>{" "}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={generatePDF}
          className="bg-SecondaryButton text-white px-4 py-2 rounded-lg shadow-lg hover:bg-SecondaryButtonHover transition-all dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Download PDF
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePrint}
          className="bg-[#4A4A4A] text-white px-4 py-2 rounded-lg shadow hover:bg-[#333333] transition"
        >
          Take Print
        </motion.button>
      </div>

      {/* Print Styles (hidden on screen) */}
      <style jsx global>{`
        @media print {
          body {
            background: white;
            color: black;
          }
          .print-area {
            width: 100%;
            font-size: 14px;
            color: black;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default Invoice;
