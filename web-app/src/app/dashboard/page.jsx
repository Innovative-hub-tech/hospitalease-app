"use client";

import { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  Activity,
  Building2,
  Stethoscope,
  TestTube,
  Pill,
  DollarSign,
  FileText,
  Syringe,
  Home,
  Bed,
} from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchUserInfo();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInfo = async () => {
    try {
      // This would typically come from the session
      // For now, we'll just set a placeholder
      setUserInfo({
        name: "Staff Member",
        department: "Reception",
        role: "staff",
      });
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  const departments = [
    {
      name: "Reception/FrontDesk",
      icon: Home,
      color: "bg-blue-500",
      path: "/patients",
    },
    { name: "Vitals", icon: Activity, color: "bg-red-500", path: "/vitals" },
    {
      name: "Consulting Room",
      icon: Stethoscope,
      color: "bg-green-500",
      path: "/consulting",
    },
    {
      name: "Laboratory",
      icon: TestTube,
      color: "bg-purple-500",
      path: "/laboratory",
    },
    { name: "Pharmacy", icon: Pill, color: "bg-orange-500", path: "/pharmacy" },
    {
      name: "Finance",
      icon: DollarSign,
      color: "bg-yellow-500",
      path: "/finance",
    },
    { name: "HMO", icon: FileText, color: "bg-indigo-500", path: "/hmo" },
    { name: "Wards", icon: Bed, color: "bg-cyan-500", path: "/wards" },
    {
      name: "Injection/Dressing",
      icon: Syringe,
      color: "bg-pink-500",
      path: "/injection",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8" />
              <div>
                <h1 className="text-3xl font-bold">HospitalEase</h1>
                {userInfo && (
                  <p className="text-blue-100 text-sm">
                    Welcome, {userInfo.name} ({userInfo.department})
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              {userInfo?.role === "global_admin" && (
                <button
                  onClick={() => (window.location.href = "/admin/dashboard")}
                  className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
                >
                  Admin Dashboard
                </button>
              )}
              <button
                onClick={() => (window.location.href = "/")}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Patients</p>
                <p className="text-3xl font-bold text-gray-800">
                  {loading ? "..." : stats?.total_active_patients || 0}
                </p>
              </div>
              <Users className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">In-Patients</p>
                <p className="text-3xl font-bold text-gray-800">
                  {loading ? "..." : stats?.total_inpatients || 0}
                </p>
              </div>
              <Bed className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Out-Patients</p>
                <p className="text-3xl font-bold text-gray-800">
                  {loading ? "..." : stats?.total_outpatients || 0}
                </p>
              </div>
              <UserPlus className="w-12 h-12 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Today's Visits</p>
                <p className="text-3xl font-bold text-gray-800">
                  {loading ? "..." : stats?.todays_visits || 0}
                </p>
              </div>
              <Activity className="w-12 h-12 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => (window.location.href = "/patients/new")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Register New Patient
            </button>
            <button
              onClick={() => (window.location.href = "/patients")}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5" />
              View All Patients
            </button>
            <button
              onClick={() => (window.location.href = "/vitals/new")}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              <Activity className="w-5 h-5" />
              Record Vitals
            </button>
          </div>
        </div>

        {/* Departments Grid */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Departments</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {departments.map((dept) => {
              const Icon = dept.icon;
              return (
                <button
                  key={dept.name}
                  onClick={() => (window.location.href = dept.path)}
                  className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl p-4 text-center transition hover:shadow-md group"
                >
                  <div
                    className={`${dept.color} w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">
                    {dept.name}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
