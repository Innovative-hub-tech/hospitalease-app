"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Home } from "lucide-react";
import DepartmentQueue from "../../components/DepartmentQueue";

export default function ReceptionPage() {
  const [departments, setDepartments] = useState([]);
  const [receptionId, setReceptionId] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/departments");
      if (!response.ok) throw new Error("Failed to fetch departments");
      const data = await response.json();
      if (data.success) {
        setDepartments(data.departments);
        const reception = data.departments.find(
          (d) => d.name === "Reception/FrontDesk",
        );
        if (reception) setReceptionId(reception.id);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const getNextDepartments = () => {
    if (!departments.length) return [];

    const hmoOffice = departments.find((d) => d.name === "HMO");
    const vitals = departments.find((d) => d.name === "Vitals");

    const next = [];
    if (hmoOffice) {
      next.push({ id: hmoOffice.id, name: "HMO Office (for HMO patients)" });
    }
    if (vitals) {
      next.push({ id: vitals.id, name: "Vitals Room" });
    }

    return next;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => (window.location.href = "/dashboard")}
                className="hover:bg-white/20 p-2 rounded-lg transition"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3">
                <Home className="w-8 h-8" />
                <div>
                  <h1 className="text-3xl font-bold">Reception/FrontDesk</h1>
                  <p className="text-blue-100 text-sm">
                    Patient Registration & Check-in
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-bold text-blue-900 mb-2">
            Workflow Instructions
          </h2>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>
              • Register new patients using the "Register New Patient" button
            </li>
            <li>
              • Collect basic information: name, sex, address, next of kin,
              phone number
            </li>
            <li>• Check if patient has HMO insurance</li>
            <li>
              • <strong>HMO patients</strong> → Transfer to HMO Office first
            </li>
            <li>
              • <strong>Non-HMO patients</strong> → Transfer directly to Vitals
              Room
            </li>
          </ul>
        </div>

        {/* Queue */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Patient Queue</h2>
            <button
              onClick={() => (window.location.href = "/patients/new")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Register New Patient
            </button>
          </div>

          {receptionId && (
            <DepartmentQueue
              departmentId={receptionId}
              departmentName="Reception/FrontDesk"
              nextDepartments={getNextDepartments()}
            />
          )}
        </div>
      </div>
    </div>
  );
}
