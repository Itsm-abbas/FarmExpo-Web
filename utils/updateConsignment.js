const UpdateConsignment = async (consignmentId, updatedFields, status) => {
  try {
    // Fetch the existing consignment details
    const existingResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/consignment/${consignmentId}`
    );
    if (!existingResponse.ok) {
      throw new Error("Failed to fetch existing consignment.");
    }

    const existingConsignment = await existingResponse.json();

    // Merge the existing consignment data with the updated fields
    const updatedConsignment = {
      ...existingConsignment,
      ...updatedFields,
      ...(status && { status }),
    };
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/consignment/${consignmentId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedConsignment),
      }
    );
    if (!response.ok) {
      throw new Error("Failed to update consignment.");
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error updating consignment:", error);
    throw error;
  }
};

export default UpdateConsignment;
