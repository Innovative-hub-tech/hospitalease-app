"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, FileText } from "lucide-react";
import DepartmentQueue from "../../components/DepartmentQueue";

export default function HMOPage() {
  const [departments, setDepartments] = useState([]);
  const [hmoId, setHmoId] = useState(null);

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
        const hmo = data.departments.find((d) => d.name === "HMO");
        if (hmo) setHmoId(hmo.id);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const getNextDepartments = () => {
    if (!departments.length) return [];

    const vitals = departments.find((d) => d.name === "Vitals");
    return vitals ? [{ id: vitals.id, name: "Vitals Room" }] : [];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-800 to-indigo-600 text-white">
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
                <FileText className="w-8 h-8" />
                <div>
                  <h1 className="text-3xl font-bold">HMO Office</h1>
                  <p className="text-indigo-100 text-sm">
                    Health Insurance Processing
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Info Card */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-bold text-indigo-900 mb-2">
            Workflow Instructions
          </h2>
          <ul className="text-indigo-800 text-sm space-y-1">
            <li>• Collect HMO ID number and verify patient details</li>
            <li>• Confirm HMO provider name</li>
            <li>
              • Document reason for visit (consultation, tests, admission, etc.)
            </li>
            <li>• Verify HMO coverage and authorization</li>
            <li>• Send details to HMO partners for approval</li>
            <li>• Once processed → Transfer to Vitals Room</li>
          </ul>
        </div>

        {/* Queue */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            HMO Patient Queue
          </h2>
          {hmoId && (
            <DepartmentQueue
              departmentId={hmoId}
              departmentName="HMO"
              nextDepartments={getNextDepartments()}
            />
          )}
        </div>
      </div>
    </div>
  );
}
