"use client";

import { useEffect, useState } from "react";
import { AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

export default function DepartmentHistory({ patientId }) {
  const [visits, setVisits] = useState([]);
  const [medicalInfo, setMedicalInfo] = useState({});
  const [expandedVisit, setExpandedVisit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDepartmentHistory();
  }, [patientId]);

  const fetchDepartmentHistory = async () => {
    try {
      const response = await fetch(
        `/api/workflow/history?patient_id=${patientId}`
      );
      if (!response.ok) throw new Error("Failed to fetch department history");
      const data = await response.json();
      if (data.success) {
        setVisits(data.departmentVisits || []);
        // Create map of medical info by department_visit_id
        const infoMap = {};
        (data.medicalInfo || []).forEach((info) => {
          infoMap[info.department_visit_id] = info;
        });
        setMedicalInfo(infoMap);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = (entry, exit) => {
    if (!exit) return "In progress";
    const diff = new Date(exit) - new Date(entry);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
          Department History
        </h2>
        <div className="text-center py-8 text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
          Department History
        </h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (visits.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
          Department History
        </h2>
        <p className="text-center py-8 text-gray-500">No department visits yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
        Department History
      </h2>
      <div className="space-y-3">
        {visits.map((visit) => {
          const info = medicalInfo[visit.id];
          const isExpanded = expandedVisit === visit.id;

          return (
            <div
              key={visit.id}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Header */}
              <button
                onClick={() =>
                  setExpandedVisit(isExpanded ? null : visit.id)
                }
                className="w-full p-4 hover:bg-gray-50 transition flex items-center justify-between"
              >
                <div className="text-left">
                  <p className="font-semibold text-gray-900">
                    {visit.department_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(visit.entry_time).toLocaleString()} -{" "}
                    {visit.exit_time
                      ? new Date(visit.exit_time).toLocaleString()
                      : "In progress"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Duration: {calculateDuration(visit.entry_time, visit.exit_time)}
                  </p>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {/* Expanded Content */}
              {isExpanded && info && (
                <div className="bg-gray-50 p-4 border-t space-y-3">
                  {info.drugs_prescribed && info.drugs_prescribed.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        Drugs Prescribed:
                      </p>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {info.drugs_prescribed.map((drug, idx) => (
                          <li key={idx}>{drug}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {info.diagnostic_tests && info.diagnostic_tests.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        Diagnostic Tests:
                      </p>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {info.diagnostic_tests.map((test, idx) => (
                          <li key={idx}>{test}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {info.health_complaints && info.health_complaints.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        Health Complaints:
                      </p>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {info.health_complaints.map((complaint, idx) => (
                          <li key={idx}>{complaint}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {info.referrals && info.referrals.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        Referrals:
                      </p>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {info.referrals.map((referral, idx) => (
                          <li key={idx}>{referral}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {info.notes && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        Notes:
                      </p>
                      <p className="text-sm text-gray-600">{info.notes}</p>
                    </div>
                  )}

                  {!info.drugs_prescribed &&
                    !info.diagnostic_tests &&
                    !info.health_complaints &&
                    !info.referrals &&
                    !info.notes && (
                      <p className="text-sm text-gray-500 italic">
                        No medical information recorded
                      </p>
                    )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
