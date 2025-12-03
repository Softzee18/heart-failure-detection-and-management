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
  Shield,
  Users,
  Search,
  Trash2,
  TrendingUp,
  TrendingDown,
  XCircle,
} from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";
import { toast } from "sonner";
import AdminUpdateUser from "@/components/AdminUpdateUser";

const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState([
    {
      title: "Total Users",
      value: "0",
      change: "+0%",
      icon: Users,
      description: "Doctors, nurses, and staff",
      trend: "up",
    },
    {
      title: "Active Users",
      value: "0",
      change: "+0%",
      icon: Users,
      description: "Currently active",
      trend: "up",
    },
    {
      title: "Admin Users",
      value: "0",
      change: "+0",
      icon: Shield,
      description: "Total admin users",
      trend: "down",
    },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/api/admin/users`,
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
          const transformedUsers = data.users.map((user) => ({
            id: user._id,
            name: user.username,
            email: user.email,
            role: user.role,
            status: user.status || "Active",
            avatar: user.username ? user.username.charAt(0).toUpperCase() : "U",
          }));

          setUsers(transformedUsers);

          // Update stats based on actual data
          const totalUsers = transformedUsers.length;
          const activeUsers = transformedUsers.filter(
            (user) => user.status === "Active"
          ).length;
          const adminUsers = transformedUsers.filter(
            (user) => user.role.toLowerCase() === "admin"
          ).length; // Changed from pendingUsers to adminUsers

          setStats([
            {
              ...stats[0],
              value: totalUsers.toString(),
            },
            {
              ...stats[1],
              value: activeUsers.toString(),
            },
            {
              ...stats[2],
              value: adminUsers.toString(), // Changed from pendingUsers to adminUsers
            },
          ]);

          // Show success message
          if (data.message) {
            toast.success(data.message);
          }
        } else {
          setError(data.message || "Failed to fetch users");
          toast.error(data.message || "Failed to fetch users");
        }
      } catch (error) {
        console.error("❌ Error fetching data:", error);
        setError(error.message || "Failed to fetch users");
        toast.error(error.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getRoleBadgeVariant = (role) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "destructive";
      case "doctor":
        return "default";
      case "nurse":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "default";
      case "inactive":
        return "secondary";
      case "pending":
        return "outline";
      default:
        return "outline";
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole =
      roleFilter === "all" || user.role.toLowerCase() === roleFilter;
    return matchesSearch && matchesRole;
  });

  const StatCard = ({ stat }) => (
    <Card className="h-full border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {stat.title}
        </CardTitle>
        <div className="p-2 bg-blue-50 rounded-lg">
          <stat.icon className="h-4 w-4 text-blue-600" />
        </div>
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

  const UserRow = ({ user }) => (
    <TableRow key={user.id} className="hover:bg-gray-50">
      <TableCell>
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-blue-100 text-blue-800">
              {user.avatar}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
      </TableCell>
      <TableCell>
        <Badge variant={getStatusBadgeVariant(user.status)}>
          {user.status}
        </Badge>
      </TableCell>

      <TableCell className="text-right">
        <div className="flex justify-end space-x-2">
          <AdminUpdateUser user={user} />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={async () => {
              const confirmDelete = window.confirm(
                "Are you sure you want to delete this user?"
              );
              if (!confirmDelete) return;

              try {
                const response = await fetch(
                  `${import.meta.env.VITE_SERVER_URL}/api/admin/delete/${
                    user.id
                  }`,
                  {
                    method: "DELETE",
                    headers: {
                      "Content-Type": "application/json",
                      token: localStorage.getItem("token"),
                    },
                  }
                );

                const data = await response.json();

                if (data.success) {
                  toast.success(data.message || "User deleted successfully!");

                  setUsers((prev) => prev.filter((u) => u.id !== user.id));
                  setTimeout(() => {
                    window.location.reload(true);
                  }, 2000);
                } else {
                  toast.error(data.message || "Failed to delete user");
                }
              } catch (error) {
                console.error("Error deleting user:", error);
                toast.error("Error deleting user");
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <XCircle className="h-6 w-6 text-red-600" />
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 left-0 w-full z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="p-2 bg-blue-600 rounded-lg mr-3">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Admin Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <LogoutButton />
              <Avatar>
                <AvatarImage src="/admin-avatar.jpg" />
                <AvatarFallback className="bg-blue-100 text-blue-800">
                  AD
                </AvatarFallback>
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

        {/* User Management Section */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-xl">User Management</CardTitle>
                <CardDescription>
                  Manage all users in the system
                </CardDescription>
              </div>
              {/* <Button className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button> */}
            </div>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[180px] border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="nurse">Nurse</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-medium text-gray-700">
                      User
                    </TableHead>
                    <TableHead className="font-medium text-gray-700">
                      Role
                    </TableHead>

                    <TableHead className="font-medium text-gray-700">
                      Status
                    </TableHead>

                    <TableHead className="font-medium text-gray-700 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <UserRow key={user.id} user={user} />
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center">
                          <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <Users className="h-6 w-6 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-1">
                            No users found
                          </h3>
                          <p className="text-gray-500 mb-4">
                            Try adjusting your search or filter criteria
                          </p>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSearchTerm("");
                              setRoleFilter("all");
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
    </div>
  );
};

export default AdminDashboard;
