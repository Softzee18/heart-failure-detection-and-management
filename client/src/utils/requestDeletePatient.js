import { toast } from "sonner";

async function requestDeletePatient(id) {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/api/doctor/deletePatients/${id}`,
      {
        method: "DELETE",
        headers: {
          token: localStorage.getItem("token"),
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      toast.error("Error deleting Patient");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    toast.error(
      error.message || "Somrthing went wrong while try to delete patient."
    );

    throw new Error("Somrthing went wrong while try to delete patient.");
  }
}

export default requestDeletePatient;
