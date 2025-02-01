import React from "react";
import Link from "next/link";
import fonts from "@utils/fonts";

const LinkButton = ({ title, desc, href, icon: Icon }) => {
  return (
    <Link href={href} legacyBehavior>
      <a
        className={`group block rounded-lg border border-gray-300 dark:border-gray-700  shadow-md hover:shadow-lg transition-shadow duration-300 p-3 hover:bg-gray-200 dark:hover:bg-gray-700 ${fonts.poppins.className}`}
      >
        <div className="flex items-center space-x-4">
          {Icon && (
            <div className="p-2 rounded-full bg-PrimaryButton text-white">
              <Icon className="text-lg" />
            </div>
          )}
          <div>
            <h3 className="text-lg  text-gray-800 dark:text-gray-200">
              {title}
            </h3>
            {desc && (
              <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
            )}
          </div>
        </div>
      </a>
    </Link>
  );
};

export default LinkButton;
