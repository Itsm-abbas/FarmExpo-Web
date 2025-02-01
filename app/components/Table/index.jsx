import fonts from "@utils/fonts";
import React from "react";
import { MdDelete, MdEdit } from "react-icons/md";
import Swal from "sweetalert2";
import { motion } from "framer-motion";

const ReusableTable = ({
  title,
  headers,
  data,
  onDelete,
  onEdit,
  isLoading,
  addButton,
  noDataMessage = "No data found",
}) => {
  const paddingClass = headers.length < 5 ? "px-10 py-2" : "px-4 py-2";

  return (
    <div className="space-y-4">
      <div
        className={`${fonts.poppins.className} border-2 border-LightBorder dark:border-DarkBorder shadow-md rounded-md p-3 md:p-6 text-LightPText dark:text-DarkPText`}
      >
        <h2 className="text-xl font-semibold mb-4 capitalize">{title}</h2>

        {isLoading ? (
          <table className="table-auto text-sm md:text-base border-collapse border border-LightBorder dark:border-DarkBorder capitalize">
            <thead>
              <tr className="bg-PrimaryButton text-white">
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className={`${paddingClass} border border-LightBorder dark:border-DarkBorder`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  {headers.map((_, idx) => (
                    <td
                      key={idx}
                      className="border border-LightBorder dark:border-DarkBorder px-4 py-2 text-center"
                    >
                      <div className="animate-pulse bg-gray-300 dark:bg-gray-700 h-4 rounded-md"></div>
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="table-auto text-sm md:text-base border-collapse border border-LightBorder dark:border-DarkBorder capitalize">
            <thead>
              <tr className="bg-PrimaryButton text-white">
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className={`${paddingClass} border border-LightBorder dark:border-DarkBorder`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.length > 0 ? (
                data.map((item, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <td className="border border-LightBorder dark:border-DarkBorder px-4 py-2 text-center">
                      {index + 1}
                    </td>
                    {headers.slice(1, -1).map((field, idx) => (
                      <td
                        key={idx}
                        className="border border-LightBorder dark:border-DarkBorder px-4 py-2 text-center"
                      >
                        {item[field]}
                      </td>
                    ))}
                    <td className="border border-LightBorder dark:border-DarkBorder px-4 py-2 text-center flex justify-center items-center">
                      <button
                        onClick={() => onEdit(item.id)}
                        className="text-blue-500 hover:underline text-xl"
                      >
                        <MdEdit />
                      </button>
                      <span className="mx-2 font-bold">|</span>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="text-red-500 hover:underline text-xl"
                      >
                        <MdDelete />
                      </button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={headers.length}
                    className="text-center text-lg font-semibold px-4 py-2"
                  >
                    {noDataMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      {addButton}
    </div>
  );
};

export default ReusableTable;
