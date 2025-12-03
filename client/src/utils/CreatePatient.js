import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";

async function CreatePatient(patientData, setLoading, Navigate) {
  const {
    patient_data,
    prediction,
    probability,
    recommendations,
    risk_level,
    user_Details,
  } = patientData;

  const allData = {
    ...user_Details,
    ...patient_data,
    prediction,
    probability,
    ...recommendations,
    risk_level,
  };

  const token = localStorage.getItem("token");

  // If no token, redirect immediately
  if (!token) {
    toast.error("You must be logged in to access this page.");
    // redirect to login using window.location.href
    return (window.location.href = "/auth/login");
  }

  try {
    const decoded = jwtDecode(token);

    if (!decoded?.role || !decoded?.exp) {
      toast.error("Invalid authentication token.");
      return (window.location.href = "/auth/login");
    }

    const doctor_id = decoded.userId;
    allData.doctor = doctor_id;
  } catch (error) {
    console.error("Error decoding or validating token:", error);
    localStorage.removeItem("token");
    toast.error("Authentication failed. Please log in again.");
    return (window.location.href = "/auth/login");
  }

  // make sure all the fields are not empty
  if (
    !allData.email ||
    !allData.phone_number ||
    !allData.Username ||
    !allData.assignedNurseEmail ||
    allData.status === "New" ||
    !allData.doctor
  ) {
    toast.error(
      "Email, phone number, assigned nurse email, doctor, status and username are required"
    );
    setLoading(false);
    throw new Error(
      "Email, phone number, assigned nurse email, doctor status and username are required"
    );
  }

  const response = await fetch(
    `${import.meta.env.VITE_SERVER_URL}/api/user/create`,
    {
      method: "POST",
      headers: {
        token: localStorage.getItem("token"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(allData),
    }
  );
  if (!response.ok) {
    const errorData = await response.json();
    toast.error(errorData.message || "Failed to create patient record");
    setLoading(false);
    throw new Error(errorData.message || "Failed to create patient record");
  }

  toast.success("Patient record created successfully");
  setLoading(false);
  return await response.json();
}

export default CreatePatient;
