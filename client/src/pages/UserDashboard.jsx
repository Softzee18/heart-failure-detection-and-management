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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  Activity,
  Pill,
  AlertTriangle,
  CheckCircle,
  Phone,
  BookOpen,
  ExternalLink,
  Mail,
} from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";
import { toast } from "sonner";

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    name: "",
    age: 0,
    gender: "",
    phone: "",
    avatar: "",
    doctor: "",
    email: "",
    doctorEmail: "",
  });

  // Health stats from backend
  const [healthStats, setHealthStats] = useState([]);

  // Medications from backend
  const [medications, setMedications] = useState([]);

  // Risk assessment from backend
  const [predictions, setPredictions] = useState([]);

  // Recommended videos (static)
  const recommendedVideos = [
    {
      title: "Living with Heart Failure",
      videoId: "4c0-SB0A9Ps",
      duration: "5 min",
      source: "Cardiac Foundation",
    },
    {
      title: "Heart-Healthy Cooking",
      videoId: "H-M0fYEg2VQ",
      duration: "15 min",
      source: "Nutrition Experts",
    },
  ];

  // Education resources (static as previously)
  const education = [
    {
      title: "Understanding Heart Failure",
      type: "Article",
      duration: "5 min read",
      category: "Education",
      link: "https://www.ncbi.nlm.nih.gov/books/NBK430873/",
    },
    {
      title: "Exercise for Heart Health",
      type: "Video",
      duration: "13 min",
      category: "Fitness",
      videoId: "STdpqao6V2E",
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/api/user/data`,
          {
            method: "GET",
            headers: {
              token: localStorage.getItem("token"),
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          toast.error("Failed to get patient record");
          throw new Error("Failed to get patient record");
        }

        const data = await response.json();
        const userInfo = data.data;

        // Handle case where userInfo is an empty array
        if (Array.isArray(userInfo) && userInfo.length === 0) {
          // User has no data yet
          setUserData({
            name: "",
            age: 0,
            gender: "",
            phone: "",
            avatar: "",
            email: "",
            doctor: "",
            doctorEmail: "",
          });
          setHealthStats([]);
          setMedications([]);
          setPredictions([]);
          setLoading(false);
          return;
        }

        // Set user basic info
        setUserData({
          name: userInfo.Username || "",
          age: userInfo.age || 0,
          gender:
            userInfo.sex === "M"
              ? "Male"
              : userInfo.sex === "F"
              ? "Female"
              : "",
          phone: userInfo.phone_number || "",
          avatar: userInfo.Username
            ? userInfo.Username.charAt(0).toUpperCase()
            : "",
          email: userInfo.email || "",
          doctor: userInfo.doctor_name || "",
          doctorEmail: userInfo.doctor_email || "",
        });

        // Set health stats from backend data - replacing Heart Health Score with Resting Blood Pressure
        setHealthStats([
          {
            title: "Resting Blood Pressure",
            value: `${userInfo.resting_bp || "N/A"} mmHg`,
            icon: Activity,
            description: "Blood pressure at rest",
            color:
              userInfo.resting_bp > 140
                ? "text-red-500"
                : userInfo.resting_bp > 120
                ? "text-yellow-500"
                : "text-green-500",
          },
          {
            title: "Risk Level",
            value: userInfo.risk_level
              ? userInfo.risk_level.replace(" Risk", "")
              : "Unknown",
            icon: AlertTriangle,
            description: "Heart failure risk",
            color: userInfo.risk_level?.includes("High")
              ? "text-red-500"
              : userInfo.risk_level?.includes("Moderate")
              ? "text-yellow-500"
              : "text-green-500",
          },
          {
            title: "Status",
            value:
              userInfo.status === "normal"
                ? "Stable"
                : userInfo.status === "warning"
                ? "Moderate"
                : userInfo.status === "critical"
                ? "Critical"
                : "Unknown",
            icon: Activity,
            description: "Current health status",
            color:
              userInfo.status === "critical"
                ? "text-red-500"
                : userInfo.status === "warning"
                ? "text-yellow-500"
                : "text-green-500",
          },
        ]);

        // Set medications from backend
        setMedications(
          userInfo.medications
            ? userInfo.medications.map((med) => ({
                name: med,
                dosage: "As prescribed",
                frequency: "As directed",
                time: "As scheduled",
                status: "Active",
                adherence: "100%",
                nextRefill: "TBD",
              }))
            : []
        );

        // Set predictions from backend
        setPredictions([
          {
            date: userInfo.updatedAt
              ? new Date(userInfo.updatedAt).toISOString().split("T")[0]
              : "Unknown",
            riskLevel: userInfo.risk_level
              ? userInfo.risk_level.replace(" Risk", "")
              : "Unknown",
            probability: `${Math.round(userInfo.probability * 100)}%`,
            status:
              userInfo.status === "normal"
                ? "Stable"
                : userInfo.status === "warning"
                ? "Moderate"
                : userInfo.status === "critical"
                ? "Critical"
                : "Unknown",
            doctor: userInfo.doctor_name || "Unknown",
            recommendations: [
              ...(userInfo.lifestyle || []),
              ...(userInfo.monitoring || []),
              ...(userInfo.urgent_actions || []),
            ],
          },
        ]);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to get patient record");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  function contactDoctor(
    to,
    subject = "Patient Inquiry, Please Explain Everything Here",
    body = ""
  ) {
    const gmailLink = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(
      to
    )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    const mailtoLink = `mailto:${encodeURIComponent(
      to
    )}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Try Gmail in a new tab
    const newWindow = window.open(gmailLink, "_blank");

    // If popup blocked or Gmail not available, fallback
    if (
      !newWindow ||
      newWindow.closed ||
      typeof newWindow.closed === "undefined"
    ) {
      window.location.href = mailtoLink;
    }
  }

  const getStatusBadgeVariant = (status) => {
    switch (status.toLowerCase()) {
      case "normal":
      case "good":
      case "stable":
      case "improving":
      case "active":
        return "default";
      case "critical":
        return "destructive";
      case "scheduled":
        return "outline";
      default:
        return "outline";
    }
  };

  const getRiskBadgeVariant = (risk) => {
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

  const StatCard = ({ stat }) => (
    <Card className="h-full backdrop-blur-sm bg-white/80 border border-white/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {stat.title}
        </CardTitle>
        <stat.icon className={`h-4 w-4 ${stat.color}`} />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline">
          <div className="text-2xl font-bold">{stat.value}</div>
        </div>
        <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
      </CardContent>
    </Card>
  );

  // Function to open YouTube video
  const openYouTubeVideo = (videoId) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank");
  };

  // Function to open article link
  const openArticleLink = (link) => {
    if (link !== "#") {
      window.open(link, "_blank");
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        {/* Fixed Background Image with Overlay */}
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-indigo-900/80"></div>
        </div>

        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-white">Loading your health data...</p>
        </div>
      </div>
    );
  }

  // Show empty state if no user data
  if (!userData.name) {
    return (
      <div className="min-h-screen relative">
        {/* Fixed Background Image with Overlay */}
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://thumbs.dreamstime.com/b/red-heart-stethoscope-white-background-copy-space-top-view-check-medical-doctor-patient-pulse-health-concept-154743992.jpg')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-indigo-900/80"></div>
        </div>

        <div className="relative z-10">
          {/* Header */}
          <header className="backdrop-blur-sm bg-white/90 border-b border-white/20 sticky top-0 left-0 w-full z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <Heart className="h-8 w-8 text-red-500 mr-3" />
                  <h1 className="text-xl font-bold text-gray-900">
                    My Health Portal
                  </h1>
                </div>
                <div className="flex items-center space-x-4">
                  <LogoutButton />
                  <Avatar className="border-2 border-gray-600">
                    <AvatarImage src="/user-avatar.jpg" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
          </header>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Card className="backdrop-blur-sm bg-white/80 border border-white/20">
              <CardHeader>
                <CardTitle>No Health Data Available</CardTitle>
                <CardDescription>
                  You don't have any health records yet. Please contact your
                  healthcare provider to get started.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => window.location.reload()}>
                  Refresh Page
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Fixed Background Image with Overlay */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://thumbs.dreamstime.com/b/red-heart-stethoscope-white-background-copy-space-top-view-check-medical-doctor-patient-pulse-health-concept-154743992.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-indigo-900/80"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="backdrop-blur-sm bg-white/90 border-b border-white/20 sticky top-0 left-0 w-full z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-red-500 mr-3" />
                <h1 className="text-xl font-bold text-gray-900">
                  My Health Portal
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <LogoutButton />
                <Avatar className="border-2 border-gray-600">
                  <AvatarImage src="/user-avatar.jpg" />
                  <AvatarFallback>{userData.avatar}</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* User Profile Summary */}
          <Card className="mb-8 backdrop-blur-sm bg-white/80 border border-white/20">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-3xl font-medium">
                    {userData.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left">
                  <CardTitle className="text-2xl">
                    {userData.gender === "Male" ? "Mr. " : "Mrs. "}{" "}
                    {userData.name}
                  </CardTitle>
                  <CardDescription>
                    {userData.age}, {userData.gender}
                    <p>
                      {userData.email} • Dr. {userData.doctor}
                    </p>
                  </CardDescription>
                  <div className="flex items-center justify-center sm:justify-start space-x-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Phone className="h-4 w-4" />
                      <span>{userData.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Health Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {healthStats.map((stat, index) => (
              <StatCard key={index} stat={stat} />
            ))}
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 backdrop-blur-sm bg-white/80 border border-white/20">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="medications">Medications</TabsTrigger>
              <TabsTrigger value="predictions">Risk Assessment</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Quick Actions */}
              <Card className="backdrop-blur-sm bg-white/80 border border-white/20">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks you might need</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="h-20 flex-col"
                      onClick={() => setActiveTab("medications")}
                    >
                      <Pill className="h-6 w-6 mb-2" />
                      Medications
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex-col"
                      onClick={() => contactDoctor(userData.doctorEmail)}
                    >
                      <Mail className="h-6 w-6 mb-2" />
                      Contact Doctor
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="medications" className="space-y-6">
              <Card className="backdrop-blur-sm bg-white/80 border border-white/20">
                <CardHeader>
                  <CardTitle>Current Medications</CardTitle>
                  <CardDescription>
                    Your prescribed medications and schedule
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {medications.length > 0 ? (
                    <div className="space-y-4">
                      {medications.map((med, index) => (
                        <div
                          key={index}
                          className="p-4 border rounded-lg bg-white/50"
                        >
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                            <div>
                              <div className="font-medium">
                                {med.name} - {med.dosage}
                              </div>
                              <div className="text-sm text-gray-600">
                                {med.frequency} • {med.time}
                              </div>
                            </div>
                            <Badge
                              variant={getStatusBadgeVariant(med.status)}
                              className="mt-2 sm:mt-0"
                            >
                              {med.status}
                            </Badge>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-3">
                            <div className="text-sm">
                              <span className="font-medium">Adherence: </span>
                              <span>{med.adherence}</span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1 sm:mt-0">
                              Next refill: {med.nextRefill}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        No Medications
                      </h3>
                      <p className="text-gray-500">
                        You don't have any medications recorded.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="predictions" className="space-y-6">
              <Card className="backdrop-blur-sm bg-white/80 border border-white/20">
                <CardHeader>
                  <CardTitle>Risk Assessment History</CardTitle>
                  <CardDescription>
                    Your heart failure risk evaluations over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {predictions.length > 0 ? (
                    <div className="space-y-4">
                      {predictions.map((prediction, index) => (
                        <div
                          key={index}
                          className="p-4 border rounded-lg bg-white/50"
                        >
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3">
                            <div>
                              <div className="font-medium">
                                {prediction.date}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <Badge
                                  variant={getRiskBadgeVariant(
                                    prediction.riskLevel
                                  )}
                                >
                                  {prediction.riskLevel}
                                </Badge>
                                <span className="text-sm text-gray-600">
                                  {prediction.probability}
                                </span>
                              </div>
                            </div>
                            <Badge
                              variant={getStatusBadgeVariant(prediction.status)}
                              className="mt-2 sm:mt-0"
                            >
                              {prediction.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 mb-3">
                            Dr. {prediction.doctor}
                          </div>
                          <div>
                            <div className="font-medium text-sm mb-2">
                              Recommendations:
                            </div>
                            <ul className="text-sm space-y-1">
                              {prediction.recommendations.length > 0 ? (
                                prediction.recommendations.map(
                                  (rec, recIndex) => (
                                    <li
                                      key={recIndex}
                                      className="flex items-start space-x-2"
                                    >
                                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                      <span>{rec}</span>
                                    </li>
                                  )
                                )
                              ) : (
                                <li className="text-gray-500">
                                  No recommendations available
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        No Risk Assessments
                      </h3>
                      <p className="text-gray-500">
                        You don't have any risk assessment data.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="education" className="space-y-6">
              <Card className="backdrop-blur-sm bg-white/80 border border-white/20">
                <CardHeader>
                  <CardTitle>Educational Resources</CardTitle>
                  <CardDescription>
                    Learn more about heart health and your condition
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {education.map((item, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer bg-white/50"
                        onClick={() => {
                          if (item.type === "Video" && item.videoId) {
                            openYouTubeVideo(item.videoId);
                          } else if (item.link) {
                            openArticleLink(item.link);
                          }
                        }}
                      >
                        <div className="flex items-start space-x-3">
                          {item.type === "Video" && item.videoId ? (
                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                              <img
                                src={`https://img.youtube.com/vi/${item.videoId}/0.jpg`}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <BookOpen className="h-5 w-5 text-blue-600" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="font-medium">{item.title}</div>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <Badge variant="outline">{item.type}</Badge>
                              <span className="text-sm text-gray-600">
                                {item.duration}
                              </span>
                              {item.link && (
                                <ExternalLink className="h-3 w-3 text-gray-500" />
                              )}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {item.category}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-sm bg-white/80 border border-white/20">
                <CardHeader>
                  <CardTitle>Recommended Videos</CardTitle>
                  <CardDescription>
                    Watch helpful videos about managing your condition
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recommendedVideos.map((video, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer bg-white/50"
                        onClick={() => openYouTubeVideo(video.videoId)}
                      >
                        <div className="w-full sm:w-24 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          <img
                            src={`https://img.youtube.com/vi/${video.videoId}/0.jpg`}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                          <div className="font-medium">{video.title}</div>
                          <div className="text-sm text-gray-600">
                            {video.duration} • {video.source}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 sm:mt-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            openYouTubeVideo(video.videoId);
                          }}
                        >
                          Watch
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
