"use client";

import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import TransferButton from "./TransferButton";
import ReactivationButton from "./ReactivationButton";
import IssueReportButton from "./IssueReportButton";

export default function DepartmentQueue({
  departmentId,
  departmentName,
  nextDepartments,
}) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchPatients();
  }, [departmentId, refreshKey]);

  const fetchPatients = async () => {
    try {
      const response = await fetch(`/api/departments/${departmentId}/patients`);
      if (!response.ok) throw new Error("Failed to fetch patients");
      const data = await response.json();
      if (data.success) {
        setPatients(data.patients);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleActionComplete = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const viewPatient = (patientId) => {
    window.location.href = `/patients/${patientId}`;
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500">Loading patients...</div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 bg-white rounded-xl shadow-md">
        <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-lg font-semibold">No patients in queue</p>
        <p className="text-sm mt-2">
          Patients will appear here when transferred to this department
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Issue Report Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Department Queue</h2>
        <IssueReportButton
          departmentId={departmentId}
          onReportSubmitted={handleActionComplete}
        />
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Patient ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  HMO
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {patients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {patient.patient_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {patient.first_name} {patient.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        patient.patient_type === "in-patient"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {patient.patient_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {patient.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {patient.is_hmo ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                        {patient.hmo_name || "HMO"}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => viewPatient(patient.id)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View
                      </button>
                      {patient.status === "active" && (
                        <TransferButton
                          patientId={patient.id}
                          currentDepartmentId={departmentId}
                          onTransferComplete={handleActionComplete}
                        />
                      )}
                      {(patient.status === "discharged" || patient.status === "inactive") && (
                        <ReactivationButton
                          patientId={patient.id}
                          patientStatus={patient.status}
                          onReactivationComplete={handleActionComplete}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
