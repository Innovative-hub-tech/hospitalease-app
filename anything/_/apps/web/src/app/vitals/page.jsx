"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Activity } from "lucide-react";
import DepartmentQueue from "../../components/DepartmentQueue";

export default function VitalsPage() {
  const [departments, setDepartments] = useState([]);
  const [vitalsId, setVitalsId] = useState(null);

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
        const vitals = data.departments.find((d) => d.name === "Vitals");
        if (vitals) setVitalsId(vitals.id);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const getNextDepartments = () => {
    if (!departments.length) return [];

    const consulting = departments.find((d) => d.name === "Consulting Room");
    return consulting ? [{ id: consulting.id, name: "Consulting Room" }] : [];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-800 to-red-600 text-white">
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
                <Activity className="w-8 h-8" />
                <div>
                  <h1 className="text-3xl font-bold">Vitals Room</h1>
                  <p className="text-red-100 text-sm">
                    Patient Vital Signs Measurement
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Info Card */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-bold text-red-900 mb-2">
            Workflow Instructions
          </h2>
          <ul className="text-red-800 text-sm space-y-1">
            <li>• Record patient vital signs:</li>
            <li className="ml-6">- Temperature, Blood Pressure, Pulse</li>
            <li className="ml-6">- Respiratory Rate, Weight, Height</li>
            <li className="ml-6">- Oxygen Saturation</li>
            <li>• Update patient records with measurements</li>
            <li>• After recording → Transfer to Consulting Room</li>
          </ul>
        </div>

        {/* Queue */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Patient Queue
          </h2>
          {vitalsId && (
            <DepartmentQueue
              departmentId={vitalsId}
              departmentName="Vitals"
              nextDepartments={getNextDepartments()}
            />
          )}
        </div>
      </div>
    </div>
  );
}
