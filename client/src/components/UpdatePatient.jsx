import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Edit } from "lucide-react";
import { useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Heart,
  Activity,
  Pill,
  Monitor,
  UserCheck,
} from "lucide-react";
import getTheLatestData from "@/utils/getTheLatestData";
import UpdatePatientData from "@/utils/UpdatePatientData";

const UpdatePatient = ({ patients, setPatients, setStats, stats }) => {
  const defaultFormData = {
    age: 0,
    sex: "M",
    chest_pain: "",
    resting_bp: 0,
    cholesterol: 0,
    fasting_bs: "0",
    resting_ecg: "",
    max_hr: 0,
    exercise_angina: "N",
    oldpeak: 0,
    st_slope: "",
  };

  const [formData, setFormData] = useState({
    age: patients?.age || defaultFormData.age,
    sex: patients?.sex === "F" ? "F" : defaultFormData.sex,
    chest_pain: patients?.chest_pain || defaultFormData.chest_pain,
    resting_bp: patients?.resting_bp || defaultFormData.resting_bp,
    cholesterol: patients?.cholesterol || defaultFormData.cholesterol,
    fasting_bs: patients?.fasting_bs === "0" ? "0" : defaultFormData.fasting_bs,
    resting_ecg: patients?.resting_ecg || defaultFormData.resting_ecg,
    max_hr: patients?.max_hr || defaultFormData.max_hr,
    exercise_angina:
      patients?.exercise_angina === "N" ? "N" : defaultFormData.exercise_angina,
    oldpeak: patients?.oldpeak || defaultFormData.oldpeak,
    st_slope: patients?.st_slope || defaultFormData.st_slope,
  });

  const defaultUserDetails = {
    email: "",
    phone_number: "",
    Username: "",
    doctor: "",
    assignedNurseEmail: "",
    status: "New",
  };

  const [userDetails, setUserDetails] = useState({
    email: patients?.email || defaultUserDetails.email,
    phone_number: patients?.phone_number || defaultUserDetails.phone_number,
    Username: patients?.Username || defaultUserDetails.Username,
    doctor: patients?.doctor || defaultUserDetails.doctor,
    assignedNurseEmail:
      patients?.assignedNurseEmail || defaultUserDetails.assignedNurseEmail,
    status: patients?.status || defaultUserDetails.status,
  });

  const [oldEmail, setOldEmail] = useState(patients?.email || "");

  // const [formData, setFormData] = useState({
  //   age: patients.age ? patients.age : 0,
  //   sex: patients.sex == "F" ? "F" : "M",
  //   chest_pain: patients.chest_pain,
  //   resting_bp: patients.resting_bp,
  //   cholesterol: patients.cholesterol,
  //   fasting_bs: patients.fasting_bs == "0" ? "0" : "1",
  //   resting_ecg: patients.resting_ecg,
  //   max_hr: patients.max_hr,
  //   exercise_angina: patients.exercise_angina == "N" ? "N" : "Y",
  //   oldpeak: patients.oldpeak,
  //   st_slope: patients.st_slope,
  // });

  // // Updated user details state to match backend schema
  // const [userDetails, setUserDetails] = useState({
  //   email: patients.email,
  //   phone_number: patients.phone_number,
  //   Username: patients.Username,
  //   doctor: "",
  //   assignedNurseEmail: patients.assignedNurseEmail,
  //   status: patients.status,
  // });

  // const [oldEmail, setOldEmail] = useState(patients.email);

  const [loading, setLoading] = useState(false);
  const [save, setSave] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [predictionResult, setPredictionResult] = useState(null);
  const [userDetailsError, setUserDetailsError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle user details form changes
  const handleUserDetailsChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");
    setPredictionResult(null);

    // Prepare the data exactly as the server expects
    const predictionData = {
      age: parseInt(formData.age),
      sex: formData.sex,
      chest_pain: formData.chest_pain,
      resting_bp: parseInt(formData.resting_bp),
      cholesterol: parseInt(formData.cholesterol),
      fasting_bs: parseInt(formData.fasting_bs),
      resting_ecg: formData.resting_ecg,
      max_hr: parseInt(formData.max_hr),
      exercise_angina: formData.exercise_angina,
      oldpeak: parseFloat(formData.oldpeak),
      st_slope: formData.st_slope,
    };

    try {
      const response = await fetch(
        "https://heart-failure-detection-ml-model.onrender.com/api/assess",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(predictionData),
        }
      );

      if (!response.ok) {
        setLoading(false);
        setError("Failed to predict patient data");
        setSuccess("");
        throw new Error("Failed to predict patient data");
      }

      const data = await response.json();
      setLoading(false);

      setSuccess("Successful prediction");
      setError("");
      setPredictionResult(data);
    } catch (error) {
      setLoading(false);
      setError("Error predict patient data, check your internet connection");
      setSuccess("");
      console.error("Error predicting patient data:", error);
    }
  };

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case "High Risk":
        return "bg-red-100 text-red-800 border-red-200";
      case "Medium Risk":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low Risk":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRiskLevelIcon = (riskLevel) => {
    switch (riskLevel) {
      case "High Risk":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "Medium Risk":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "Low Risk":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button>
            <Edit className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[90%] md:max-w-[500px] lg:max-w-[1000px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Patient Information Form</DialogTitle>
            <DialogDescription>
              Fill out the form to update patient record
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col md:flex-row items-start justify-start gap-2">
              {/* Left Column */}
              <div className="w-full md:w-1/2 border border-gray-200 p-6 rounded-md">
                <h3 className="text-lg font-medium mb-4">
                  Patient Information
                </h3>

                <div className="space-y-1 mb-4">
                  <Label htmlFor="age" className="mb-3">
                    Age
                  </Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="Enter age"
                    required
                  />
                </div>

                <div className="space-y-1 mb-4">
                  <Label htmlFor="sex" className="my-3">
                    Sex
                  </Label>
                  <Select
                    value={formData.sex}
                    onValueChange={(value) => handleSelectChange("sex", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sex" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Male</SelectItem>
                      <SelectItem value="F">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1 mb-4">
                  <Label htmlFor="chest_pain" className="my-3">
                    Chest Pain Type
                  </Label>
                  <Select
                    value={formData.chest_pain}
                    onValueChange={(value) =>
                      handleSelectChange("chest_pain", value)
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ATA">Atypical Angina</SelectItem>
                      <SelectItem value="NAP">Non-Anginal Pain</SelectItem>
                      <SelectItem value="ASY">Asymptomatic</SelectItem>
                      <SelectItem value="TA">Typical Angina</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1 mb-4">
                  <Label htmlFor="resting_bp" className="my-3">
                    Resting Blood Pressure (mm Hg)
                  </Label>
                  <Input
                    id="resting_bp"
                    name="resting_bp"
                    type="number"
                    value={formData.resting_bp}
                    onChange={handleChange}
                    placeholder="Enter BP"
                    required
                  />
                </div>

                <div className="space-y-1 mb-4">
                  <Label htmlFor="cholesterol" className="my-3">
                    Cholesterol (mg/dl)
                  </Label>
                  <Input
                    id="cholesterol"
                    name="cholesterol"
                    type="number"
                    value={formData.cholesterol}
                    onChange={handleChange}
                    placeholder="Enter cholesterol"
                    required
                  />
                </div>

                <div className="space-y-1 mb-4">
                  <Label htmlFor="fasting_bs" className="my-3">
                    Fasting Blood Sugar (120 mg/dl: 1, otherwise: 0)
                  </Label>
                  <Select
                    value={formData.fasting_bs}
                    onValueChange={(value) =>
                      handleSelectChange("fasting_bs", value)
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select value" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Less than 120 mg/dl</SelectItem>
                      <SelectItem value="1">Greater than 120 mg/dl</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Right Column */}
              <div className="w-full md:w-1/2 border border-gray-200 p-6 rounded-md">
                <h3 className="text-lg font-medium mb-4">
                  Medical Test Results
                </h3>

                <div className="space-y-1 mb-4">
                  <Label htmlFor="resting_ecg" className="my-3">
                    Resting ECG Results
                  </Label>
                  <Select
                    value={formData.resting_ecg}
                    onValueChange={(value) =>
                      handleSelectChange("resting_ecg", value)
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Normal">Normal</SelectItem>
                      <SelectItem value="ST">ST-T wave abnormality</SelectItem>
                      <SelectItem value="LVH">
                        Left ventricular hypertrophy
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1 mb-4">
                  <Label htmlFor="max_hr" className="my-3">
                    Maximum Heart Rate Achieved
                  </Label>
                  <Input
                    id="max_hr"
                    name="max_hr"
                    type="number"
                    value={formData.max_hr}
                    onChange={handleChange}
                    placeholder="Enter max HR"
                    required
                  />
                </div>

                <div className="space-y-1 mb-4">
                  <Label htmlFor="exercise_angina" className="my-3">
                    Exercise Induced Angina
                  </Label>
                  <Select
                    value={formData.exercise_angina}
                    onValueChange={(value) =>
                      handleSelectChange("exercise_angina", value)
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select value" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="N">No</SelectItem>
                      <SelectItem value="Y">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1 mb-4">
                  <Label htmlFor="oldpeak" className="my-3">
                    Oldpeak (ST depression)
                  </Label>
                  <Input
                    id="oldpeak"
                    name="oldpeak"
                    type="number"
                    step="0.1"
                    value={formData.oldpeak}
                    onChange={handleChange}
                    placeholder="Enter oldpeak"
                    required
                  />
                </div>

                <div className="space-y-1 mb-4">
                  <Label htmlFor="st_slope" className="my-3">
                    ST Slope
                  </Label>
                  <Select
                    value={formData.st_slope}
                    onValueChange={(value) =>
                      handleSelectChange("st_slope", value)
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select slope" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Up">Upsloping</SelectItem>
                      <SelectItem value="Flat">Flat</SelectItem>
                      <SelectItem value="Down">Downsloping</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                {error && <p className="text-red-500">{error}</p>}
                {success && <p className="text-green-500">{success}</p>}
              </div>
              {/* Submit Button */}
              <div className="flex justify-end mt-4">
                <Button type="submit" size="lg">
                  {loading ? "Predicting..." : "Predict"}
                </Button>
              </div>
            </div>
          </form>

          {/* Prediction Results */}
          {predictionResult && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  Prediction Results
                </h3>
                <Badge
                  className={`flex items-center gap-1 px-3 py-1 ${getRiskLevelColor(
                    predictionResult.risk_level
                  )}`}
                >
                  {getRiskLevelIcon(predictionResult.risk_level)}
                  {predictionResult.risk_level}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Heart className="h-5 w-5 text-blue-500" />
                      Prediction
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {predictionResult.prediction &&
                      predictionResult.prediction == 1
                        ? "Heart Failure"
                        : "Normal"}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="h-5 w-5 text-purple-500" />
                      Probability
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {predictionResult.probability
                        ? `${
                            Math.ceil(predictionResult.probability * 10000) /
                            100
                          }%`
                        : "N/A"}
                    </p>
                  </CardContent>
                </Card>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Lifestyle Recommendations */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-green-500" />
                      Lifestyle Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {predictionResult.recommendations?.lifestyle?.map(
                        (rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>{rec}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </CardContent>
                </Card>

                {/* Medications */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Pill className="h-5 w-5 text-blue-500" />
                      Medications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {predictionResult.recommendations?.medications?.map(
                        (rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>{rec}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </CardContent>
                </Card>

                {/* Monitoring */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Monitor className="h-5 w-5 text-purple-500" />
                      Monitoring
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {predictionResult.recommendations?.monitoring?.map(
                        (rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>{rec}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </CardContent>
                </Card>

                {/* Urgent Actions */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      Urgent Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {predictionResult.recommendations?.urgent_actions?.map(
                        (rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>{rec}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </CardContent>
                </Card>
              </div>
              <div>
                <div className="flex items-center justify-start gap-2 mt-6 mb-1">
                  <input
                    type="checkbox"
                    id="saveData"
                    checked={save}
                    onChange={(e) => setSave(e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <Label
                    htmlFor="saveData"
                    className="text-sm font-medium text-gray-700"
                  >
                    Do you want to save the Data
                  </Label>
                </div>
              </div>
              {save && (
                <form
                  className="mt-4 border border-gray-200 rounded-md p-4"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setSuccess("");
                    setError("");
                    setLoading(true);

                    const patientData = {
                      user_Details: userDetails,
                      ...predictionResult,
                      oldEmail: oldEmail,
                    };

                    await UpdatePatientData(patientData, setLoading);
                    setLoading(false);
                    //  reset all the form fields
                    setUserDetails({
                      email: "",
                      phone_number: "",
                      Username: "",
                      doctor: "",
                      assignedNurseEmail: "",
                      status: "New",
                    });
                    setPredictionResult(null);
                    setFormData({
                      age: "",
                      sex: "",
                      chest_pain: "",
                      resting_bp: "",
                      cholesterol: "",
                      fasting_bs: "",
                      resting_ecg: "",
                      max_hr: "",
                      exercise_angina: "",
                      oldpeak: "",
                      st_slope: "",
                    });
                    setSave(false);
                    setTimeout(() => {
                      window.location.reload(true);
                    }, 2000);
                    try {
                      const data = await getTheLatestData();

                      // Ensure data.data is an array before mapping
                      if (Array.isArray(data.data)) {
                        // Transform backend data to frontend format with null checks
                        const transformedPatients = data.data.map(
                          (patient) => ({
                            id: patient._id || "",
                            name: patient.Username || "Unknown",
                            age: patient.age || 0,
                            gender:
                              patient.sex === "M"
                                ? "Male"
                                : patient.sex === "F"
                                ? "Female"
                                : "Unknown",
                            lastVisit: patient.updatedAt
                              ? new Date(patient.updatedAt)
                                  .toISOString()
                                  .split("T")[0]
                              : "",
                            riskLevel: patient.risk_level
                              ? patient.risk_level.replace(" Risk", "")
                              : "Unknown",
                            status:
                              patient.status === "normal"
                                ? "Stable"
                                : patient.status === "warning"
                                ? "Moderate"
                                : patient.status === "critical"
                                ? "Critical"
                                : patient.status || "Unknown",
                            avatar: patient.Username
                              ? patient.Username.split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                              : "UN",
                            contact: {
                              phone: patient.phone_number || "",
                              email: patient.email || "",
                            },
                            // Additional backend data we might want to display
                            cholesterol: patient.cholesterol || 0,
                            resting_bp: patient.resting_bp || 0,
                            max_hr: patient.max_hr || 0,
                            medications: patient.medications || [],
                            lifestyle: patient.lifestyle || [],
                          })
                        );

                        setPatients(transformedPatients);

                        // Update stats based on real data
                        const totalPatients = transformedPatients.length;
                        const highRiskCount = transformedPatients.filter(
                          (p) => p.riskLevel === "High"
                        ).length;
                        const lowRiskCount = transformedPatients.filter(
                          (p) => p.riskLevel === "Low"
                        ).length;

                        setStats([
                          {
                            ...stats[0],
                            value: totalPatients.toString(),
                          },
                          {
                            ...stats[1],
                            value: highRiskCount.toString(),
                          },
                          {
                            ...stats[2],
                            value: lowRiskCount.toString(),
                          },
                        ]);
                        setLoading(false);
                      } else {
                        console.error("Data is not an array:", data.data);
                        setPatients([]);
                        setLoading(false);
                      }
                    } catch (err) {
                      console.error("Error fetching data:", err);
                      setPatients([]);
                      setLoading(false);
                    }
                  }}
                >
                  <h4 className="text-md font-medium mb-3">Patient Details</h4>
                  {userDetailsError && (
                    <p className="text-red-500 text-sm mb-3">
                      {userDetailsError}
                    </p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="Username">Username</Label>
                      <Input
                        id="Username"
                        name="Username"
                        value={userDetails.Username}
                        onChange={handleUserDetailsChange}
                        placeholder="Enter username"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={userDetails.email}
                        onChange={handleUserDetailsChange}
                        placeholder="Enter email address"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="phone_number">Phone Number *</Label>
                      <Input
                        id="phone_number"
                        name="phone_number"
                        type="tel"
                        value={userDetails.phone_number}
                        onChange={handleUserDetailsChange}
                        placeholder="Enter phone number"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="assignedNurseEmail">
                        Assigned Nurse Email
                      </Label>
                      <Input
                        id="assignedNurseEmail"
                        name="assignedNurseEmail"
                        type="email"
                        value={userDetails.assignedNurseEmail}
                        onChange={handleUserDetailsChange}
                        placeholder="Enter nurse's email"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="status">Select Status</Label>
                      <Select
                        value={userDetails.status}
                        onValueChange={(value) =>
                          handleUserDetailsChange({
                            target: { name: "status", value },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <Label>Select status</Label>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="improving">Improving</SelectItem>
                          <SelectItem value="stable">Stable</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="my-6">
                        <Button type="submit" size="lg">
                          {loading ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UpdatePatient;

