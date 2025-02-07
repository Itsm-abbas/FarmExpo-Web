"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaArrowRight, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { SidebarLinks } from "@constants/Links";
import fonts from "@utils/fonts";
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar({ isSidebarOpen, onClose }) {
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (event.target.closest(".sidebar-content")) return;
      onClose(); // Close sidebar when clicking outside
    };

    if (isSidebarOpen) {
      document.addEventListener("click", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [isSidebarOpen, onClose]);

  return (
    <>
      {isSidebarOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-70 z-40"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}

      <motion.div
         className={`${fonts?.poppins.className} overflow-x-scroll sidebar-content fixed top-0 left-0 h-full w-72 bg-gray-200 shadow-lg text-black dark:bg-gray-900 dark:text-white z-50`}
        initial={{ x: "-100%" }}
        animate={{ x: isSidebarOpen ? "0%" : "-100%" }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-full flex flex-col items-center justify-center p-4">
          <Image
            className="rounded-full border-2 border-white"
            src="/profile.png"
            width={70}
            height={70}
            alt="profile"
          />
          <p className="mt-2 font-semibold text-lg">Abbas</p>
        </div>

        <nav className="flex flex-col space-y-4 p-4">
          {SidebarLinks.map((category, index) => (
            <div key={index} className="flex flex-col">
              <button
                onClick={() => toggleDropdown(index)}
                className="flex items-center justify-between p-3 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 rounded-lg"
              >
                <span>{category.name}</span>
                {openDropdown === index ? <FaChevronUp /> : <FaChevronDown />}
              </button>

              <AnimatePresence>
                {openDropdown === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="flex text-sm flex-col pl-4 space-y-2 mt-2">
                      {category.links.map((link, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <FaArrowRight className="text-xs" />
                          <Link href={link.href} onClick={onClose}>
                            <span className="hover:text-PrimaryButton cursor-pointer">
                              {link.name}
                            </span>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>
      </motion.div>
    </>
  );
}
