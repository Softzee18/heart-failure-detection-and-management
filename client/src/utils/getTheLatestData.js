async function getTheLatestData() {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/api/doctor/getPatients`,
      {
        method: "GET",
        headers: {
          token: localStorage.getItem("token"),
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching the latest data:", error);
    return [];
  }
}

export default getTheLatestData;
