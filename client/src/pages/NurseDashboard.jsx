"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  HeartPulse,
  Activity,
  Users,
  Search,
  Filter,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Heart,
  Phone,
  Mail,
  MapPin,
  Pill,
  FileText,
  AlertCircle,
  Eye,
} from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";
import { toast } from "sonner";

const NurseDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [nurseStats, setNurseStats] = useState([
    {
      title: "Assigned Patients",
      value: "0",
      change: "+0",
      icon: Users,
      description: "Under your care",
      trend: "up",
    },
    {
      title: "High Risk Patients",
      value: "0",
      change: "+0",
      icon: AlertTriangle,
      description: "Need attention",
      trend: "stable",
    },
    {
      title: "Critical Patients",
      value: "0",
      change: "+0",
      icon: Heart,
      description: "Immediate care",
      trend: "up",
    },
    {
      title: "Medications Due",
      value: "0",
      change: "+0",
      icon: Pill,
      description: "Scheduled today",
      trend: "down",
    },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/api/nurse/getPatients`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem("token"),
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          // Transform backend data to frontend format
          const transformedPatients = data.patients.map((patient) => ({
            id: patient._id,
            name: patient.Username,
            age: patient.age,
            gender: patient.sex === "M" ? "Male" : "Female",
            email: patient.email,
            phone: patient.phone_number,
            doctor: patient.doctor_name,
            doctorEmail: patient.doctor_email,
            assignedNurseEmail: patient.assignedNurseEmail,
            riskLevel: patient.risk_level
              ? patient.risk_level.replace(" Risk", "")
              : "Unknown",
            status: patient.status || "Unknown",
            lastUpdated: patient.updatedAt
              ? new Date(patient.updatedAt).toLocaleDateString()
              : "Unknown",
            avatar: patient.Username
              ? patient.Username.charAt(0).toUpperCase()
              : "P",
            vitals: {
              bp: patient.resting_bp ? `${patient.resting_bp} mmHg` : "N/A",
              hr: patient.max_hr ? `${patient.max_hr} bpm` : "N/A",
              cholesterol: patient.cholesterol
                ? `${patient.cholesterol} mg/dL`
                : "N/A",
              oldpeak: patient.oldpeak ? `${patient.oldpeak}` : "N/A",
            },
            prediction: patient.prediction,
            probability: patient.probability
              ? `${Math.round(patient.probability * 100)}%`
              : "N/A",
            medications: patient.medications || [],
            lifestyle: patient.lifestyle || [],
            monitoring: patient.monitoring || [],
            urgent_actions: patient.urgent_actions || [],
            referrals: patient.referrals || [],
            chest_pain: patient.chest_pain,
            exercise_angina: patient.exercise_angina,
            fasting_bs: patient.fasting_bs,
            resting_ecg: patient.resting_ecg,
            st_slope: patient.st_slope,
          }));

          setPatients(transformedPatients);

          // Update stats based on actual data
          const totalPatients = transformedPatients.length;
          const highRiskPatients = transformedPatients.filter(
            (p) => p.riskLevel === "High"
          ).length;
          const criticalPatients = transformedPatients.filter(
            (p) => p.status === "critical"
          ).length;
          const medicationsDue = transformedPatients.reduce(
            (sum, p) => sum + (p.medications ? p.medications.length : 0),
            0
          );

          setNurseStats([
            {
              ...nurseStats[0],
              value: totalPatients.toString(),
              change: `+${totalPatients}`,
            },
            {
              ...nurseStats[1],
              value: highRiskPatients.toString(),
              change: highRiskPatients > 0 ? `+${highRiskPatients}` : "0",
            },
            {
              ...nurseStats[2],
              value: criticalPatients.toString(),
              change: criticalPatients > 0 ? `+${criticalPatients}` : "0",
            },
            {
              ...nurseStats[3],
              value: medicationsDue.toString(),
              change: `+${medicationsDue}`,
            },
          ]);

          // Show success message
          if (data.message) {
            toast.success(data.message);
          }
        } else {
          setError(data.message || "Failed to fetch patients");
          toast.error(data.message || "Failed to fetch patients");
        }
      } catch (error) {
        console.error("❌ Error fetching data:", error);
        setError(error.message || "Failed to fetch patients");
        toast.error(error.message || "Failed to fetch patients");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setIsDialogOpen(true);
  };

  const getRiskBadgeVariant = (risk) => {
    switch (risk.toLowerCase()) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status.toLowerCase()) {
      case "critical":
        return "destructive";
      case "normal":
      case "stable":
        return "secondary";
      case "warning":
        return "default";
      default:
        return "outline";
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk =
      riskFilter === "all" || patient.riskLevel.toLowerCase() === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const StatCard = ({ stat }) => (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {stat.title}
        </CardTitle>
        <div className="p-2 bg-pink-50 rounded-lg">
          <stat.icon className="h-4 w-4 text-pink-600" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline">
          <div className="text-2xl font-bold">{stat.value}</div>
          <div
            className={`ml-2 flex items-center text-sm ${
              stat.trend === "up"
                ? "text-green-600"
                : stat.trend === "down"
                ? "text-red-600"
                : "text-gray-600"
            }`}
          >
            {stat.trend === "up" ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : stat.trend === "down" ? (
              <TrendingDown className="h-3 w-3 mr-1" />
            ) : null}
            {stat.change}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
      </CardContent>
    </Card>
  );

  const PatientRow = ({ patient }) => (
    <TableRow
      key={patient.id}
      className="hover:bg-gray-50 cursor-pointer"
      onClick={() => handleViewPatient(patient)}
    >
      <TableCell>
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-pink-100 text-pink-800">
              {patient.avatar}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{patient.name}</div>
            <div className="text-sm text-gray-500">
              {patient.age}, {patient.gender}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex items-center text-xs text-gray-500">
                <Mail className="h-3 w-3 mr-1" />
                {patient.email}
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <Phone className="h-3 w-3 mr-1" />
                {patient.phone}
              </div>
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className="flex items-center space-x-1">
            <HeartPulse className="h-3 w-3 text-red-500" />
            <span className="text-sm">{patient.vitals.bp}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Activity className="h-3 w-3 text-blue-500" />
            <span className="text-sm">{patient.vitals.hr}</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <span className="text-sm">{patient.vitals.cholesterol}</span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <Badge variant={getRiskBadgeVariant(patient.riskLevel)}>
            {patient.riskLevel}
          </Badge>
          <div className="text-xs text-gray-500 mt-1">
            {patient.probability} risk
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={getStatusBadgeVariant(patient.status)}>
          {patient.status}
        </Badge>
      </TableCell>
      <TableCell className="text-sm text-gray-500">
        <div className="flex items-center">
          <MapPin className="h-3 w-3 mr-1" />
          Dr. {patient.doctor}
        </div>
        <div className="mt-1">{patient.lastUpdated}</div>
      </TableCell>
    </TableRow>
  );

  const PatientDetailsDialog = () => (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-[90%] md:max-w-[500px] lg:max-w-[1000px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-pink-600" />
            Patient Details: {selectedPatient?.name}
          </DialogTitle>
          <DialogDescription>
            Comprehensive patient information and medical records
          </DialogDescription>
        </DialogHeader>

        {selectedPatient && (
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-pink-100 text-pink-800">
                        {selectedPatient.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{selectedPatient.name}</div>
                      <div className="text-sm text-gray-500">
                        {selectedPatient.age}, {selectedPatient.gender}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      {selectedPatient.email}
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      {selectedPatient.phone}
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      Dr. {selectedPatient.doctor}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vitals and Risk Assessment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <HeartPulse className="h-5 w-5 mr-2 text-red-500" />
                    Vitals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Blood Pressure:</span>
                      <span className="font-medium">
                        {selectedPatient.vitals.bp}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Heart Rate:</span>
                      <span className="font-medium">
                        {selectedPatient.vitals.hr}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Cholesterol:</span>
                      <span className="font-medium">
                        {selectedPatient.vitals.cholesterol}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Oldpeak:</span>
                      <span className="font-medium">
                        {selectedPatient.vitals.oldpeak}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
                    Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Risk Level:</span>
                      <Badge
                        variant={getRiskBadgeVariant(selectedPatient.riskLevel)}
                      >
                        {selectedPatient.riskLevel}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Probability:</span>
                      <span className="font-medium">
                        {selectedPatient.probability}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <Badge
                        variant={getStatusBadgeVariant(selectedPatient.status)}
                      >
                        {selectedPatient.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Last Updated:</span>
                      <span className="font-medium">
                        {selectedPatient.lastUpdated}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Medical Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Medical Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Cardiac Symptoms
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div>
                        <span className="text-gray-500">Chest Pain Type:</span>{" "}
                        {selectedPatient.chest_pain}
                      </div>
                      <div>
                        <span className="text-gray-500">Exercise Angina:</span>{" "}
                        {selectedPatient.exercise_angina}
                      </div>
                      <div>
                        <span className="text-gray-500">
                          Fasting Blood Sugar:
                        </span>{" "}
                        {selectedPatient.fasting_bs}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Test Results
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div>
                        <span className="text-gray-500">Resting ECG:</span>{" "}
                        {selectedPatient.resting_ecg}
                      </div>
                      <div>
                        <span className="text-gray-500">ST Slope:</span>{" "}
                        {selectedPatient.st_slope}
                      </div>
                      <div>
                        <span className="text-gray-500">Prediction:</span>{" "}
                        {selectedPatient.prediction === 1
                          ? "Heart Disease"
                          : "Normal"}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Contact Information
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div>
                        <span className="text-gray-500">Doctor Email:</span>{" "}
                        {selectedPatient.doctorEmail}
                      </div>
                      <div>
                        <span className="text-gray-500">Assigned Nurse:</span>{" "}
                        {selectedPatient.assignedNurseEmail}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medications */}
            {selectedPatient.medications &&
              selectedPatient.medications.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Pill className="h-5 w-5 mr-2 text-blue-500" />
                      Medications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {selectedPatient.medications.map((med, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-gray-700">{med}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

            {/* Lifestyle Recommendations */}
            {selectedPatient.lifestyle &&
              selectedPatient.lifestyle.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Lifestyle Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {selectedPatient.lifestyle.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

            {/* Monitoring Requirements */}
            {selectedPatient.monitoring &&
              selectedPatient.monitoring.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Monitoring Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {selectedPatient.monitoring.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

            {/* Urgent Actions */}
            {selectedPatient.urgent_actions &&
              selectedPatient.urgent_actions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                      Urgent Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {selectedPatient.urgent_actions.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

            {/* Referrals */}
            {selectedPatient.referrals &&
              selectedPatient.referrals.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Referrals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {selectedPatient.referrals.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patient data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl">Error Loading Data</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 left-0 w-full z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="p-2 bg-pink-600 rounded-lg mr-3">
                <HeartPulse className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Nurse Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <LogoutButton />
              <Avatar>
                <AvatarImage src="/nurse-avatar.jpg" />
                <AvatarFallback className="bg-pink-100 text-pink-800">
                  NS
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Nurse Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {nurseStats.map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))}
        </div>

        {/* Patients Section */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-xl">Assigned Patients</CardTitle>
                <CardDescription>
                  Click on a patient to view details
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search patients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-pink-500 focus:ring-pink-500"
                    />
                  </div>
                </div>
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger className="w-[180px] border-gray-300 focus:border-pink-500 focus:ring-pink-500">
                    <SelectValue placeholder="Filter by risk" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk Levels</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="low">Low Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-medium text-gray-700">
                      Patient
                    </TableHead>
                    <TableHead className="font-medium text-gray-700">
                      Vitals
                    </TableHead>
                    <TableHead className="font-medium text-gray-700">
                      Risk Level
                    </TableHead>
                    <TableHead className="font-medium text-gray-700">
                      Status
                    </TableHead>
                    <TableHead className="font-medium text-gray-700">
                      Doctor & Last Updated
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map((patient) => (
                      <PatientRow key={patient.id} patient={patient} />
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center">
                          <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <Users className="h-6 w-6 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-1">
                            No patients found
                          </h3>
                          <p className="text-gray-500 mb-4">
                            Try adjusting your search or filter criteria
                          </p>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSearchTerm("");
                              setRiskFilter("all");
                            }}
                          >
                            Clear filters
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient Details Dialog */}
      <PatientDetailsDialog />
    </div>
  );
};

export default NurseDashboard;
