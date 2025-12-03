"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Activity,
  HeartPulse,
  Users,
  Search,
  TrendingUp,
  TrendingDown,
  Trash2,
  Loader2,
} from "lucide-react";
import AddPatient from "@/components/AddPatient";
import { LogoutButton } from "@/components/LogoutButton";
import getTheLatestData from "@/utils/getTheLatestData";
import { toast } from "sonner";
import requestDeletePatient from "@/utils/requestDeletePatient";
import UpdatePatient from "@/components/UpdatePatient";

const DoctorDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [addPatientOpen, setAddPatientOpen] = useState(false);
  const [patients, setPatients] = useState([]);
  const [rowPatientData, setRowPatientData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [stats, setStats] = useState([
    {
      title: "Total Patients",
      value: "0",
      change: "+0%",
      icon: Users,
      description: "From last month",
      trend: "up",
    },
    {
      title: "High Risk",
      value: "0",
      change: "+0%",
      icon: HeartPulse,
      description: "Need immediate attention",
      trend: "up",
    },
    {
      title: "Low Risk",
      value: "0",
      change: "+0",
      icon: Activity,
      description: "Patients with low risk level",
      trend: "up",
    },
  ]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await getTheLatestData();

        // Ensure data.data is an array before mapping
        if (Array.isArray(data.data)) {
          // Transform backend data to frontend format with null checks
          const transformedPatients = data.data.map((patient) => ({
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
              ? new Date(patient.updatedAt).toISOString().split("T")[0]
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
          }));

          setRowPatientData(data.data);
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
        } else {
          console.error("Data is not an array:", data.data);
          setPatients([]);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getRiskBadgeVariant = (risk) => {
    if (!risk) return "outline";

    switch (risk.toLowerCase()) {
      case "high":
        return "destructive";
      case "moderate":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusBadgeVariant = (status) => {
    if (!status) return "outline";

    switch (status.toLowerCase()) {
      case "critical":
        return "destructive";
      case "stable":
        return "secondary";
      case "improving":
        return "default";
      case "under review":
        return "outline";
      default:
        return "outline";
    }
  };

  // Ensure patients is always an array before filtering
  const filteredPatients = Array.isArray(patients)
    ? patients.filter((patient) => {
        // Add null checks for all properties
        const patientName = patient?.name || "";
        const patientEmail = patient?.contact?.email || "";
        const patientRiskLevel = patient?.riskLevel || "";

        const matchesSearch =
          patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patientEmail.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRisk =
          riskFilter === "all" ||
          (patientRiskLevel && patientRiskLevel.toLowerCase() === riskFilter);
        return matchesSearch && matchesRisk;
      })
    : [];

  const handleDelete = async (id) => {
    const result = confirm("Are you sure you want to delete this patient?");
    if (result) {
      setDeleteLoading(id);
      try {
        // delete patient data from the database
        const deletePatient = await requestDeletePatient(id);
        if (deletePatient.success) {
          toast.success("User deleted successfully.");
          async function fetchData() {
            try {
              setLoading(true);
              const data = await getTheLatestData();

              // Ensure data.data is an array before mapping
              if (Array.isArray(data.data)) {
                // Transform backend data to frontend format with null checks
                const transformedPatients = data.data.map((patient) => ({
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
                    ? new Date(patient.updatedAt).toISOString().split("T")[0]
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
                }));

                setPatients(transformedPatients);
                setRowPatientData(data.data);

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
              } else {
                console.error("Data is not an array:", data.data);
                setPatients([]);
              }
            } catch (err) {
              console.error("Error fetching data:", err);
              setPatients([]);
            } finally {
              setLoading(false);
            }
          }
          fetchData();
          return;
        } else {
          toast.error("Can`t  deleted User.");
        }
      } catch (error) {
        toast.error("Failed to delete user. Please try again.");
        console.error("Delete error:", error);
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  const StatCard = ({ stat }) => (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {stat.title}
        </CardTitle>
        <stat.icon className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline">
          <div className="text-2xl font-bold">{stat.value}</div>
          <div
            className={`ml-2 flex items-center text-sm ${
              stat.trend === "up" ? "text-green-600" : "text-red-600"
            }`}
          >
            {stat.trend === "up" ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            {stat.change}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
      </CardContent>
    </Card>
  );

  const PatientRow = ({ patient, rowPatientData }) => (
    <TableRow key={patient.id}>
      <TableCell>
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarFallback>{patient.avatar}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{patient.name}</div>
            <div className="text-sm text-gray-500">
              {patient.contact?.email || ""}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        {patient.age}, {patient.gender}
      </TableCell>
      <TableCell>
        <Badge variant={getRiskBadgeVariant(patient.riskLevel)}>
          {patient.riskLevel}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={getStatusBadgeVariant(patient.status)}>
          {patient.status}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end space-x-2">
          <div>
            <UpdatePatient
              patients={rowPatientData}
              setPatients={setPatients}
              setStats={setStats}
              stats={stats}
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="hover:cursor-pointer"
            onClick={() => handleDelete(patient.id)}
            disabled={deleteLoading === patient.id}
          >
            {deleteLoading === patient.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patient data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 left-0 w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <HeartPulse className="h-8 w-8 text-red-500 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">
                CardiacCare AI
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <LogoutButton />
              <Avatar>
                <AvatarImage src="/doctor-avatar.jpg" />
                <AvatarFallback>DR</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))}
        </div>

        <div className="space-y-6">
          <AddPatient
            setPatients={setPatients}
            setStats={setStats}
            stats={stats}
          />

          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search patients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Select value={riskFilter} onValueChange={setRiskFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by risk" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Risk Levels</SelectItem>
                      <SelectItem value="high">High Risk</SelectItem>
                      <SelectItem value="moderate">Moderate Risk</SelectItem>
                      <SelectItem value="low">Low Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Age/Gender</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((patient, index) => (
                        <PatientRow
                          key={patient.id}
                          patient={patient}
                          rowPatientData={rowPatientData[index]}
                        />
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          {loading ? (
                            <div className="flex justify-center items-center">
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Loading patients...
                            </div>
                          ) : (
                            "No patients found"
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
