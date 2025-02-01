import React, { useState } from "react";
import fonts from "@utils/fonts";
import { motion } from "framer-motion";

const Input = ({ id, type = "text", value, onChange, placeholder }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`${fonts.poppins.className} relative w-full`}>
      {/* Animated Label */}
      <motion.label
        htmlFor={id}
        className="absolute text-gray-500 transition-all"
        initial={{ top: "50%", left: "12px", fontSize: "16px", opacity: 0.8 }}
        animate={{
          top: isFocused || value ? "-18px" : "20%",
          left: isFocused || value ? "8px" : "12px",
          fontSize: isFocused || value ? "12px" : "15px",
          opacity: isFocused || value ? 0.9 : 0.8,
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }} // Smoother animation
      >
        {placeholder}
      </motion.label>

      {/* Input Field */}
      <input
        id={id}
        type={type}
        className="text-black dark:text-white mb-4 mt-7 block w-full border border-LightBorder dark:border-DarkBorder dark:bg-[#2d3748] rounded-md p-2 focus:ring-PrimaryButton focus:border-PrimaryButton dark:focus:ring-PrimaryButton dark:focus:border-PrimaryButton outline-none"
        value={value}
        onChange={onChange}
        placeholder=" " // Keep a space to maintain height for the label animation
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        required
      />
    </div>
  );
};

export default Input;
