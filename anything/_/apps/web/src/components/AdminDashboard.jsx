"use client";

import { useEffect, useState } from "react";
import { AlertCircle, AlertTriangle } from "lucide-react";

export default function AdminDashboard({ adminRole, departmentId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedDept, setSelectedDept] = useState(departmentId || "");

  useEffect(() => {
    fetchDashboardData();
  }, [startDate, endDate, selectedDept]);

  const fetchDashboardData = async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (selectedDept && adminRole === "global") {
        params.append("departmentId", selectedDept);
      }

      const response = await fetch(`/api/admin/dashboard?${params}`);
      if (!response.ok) throw new Error("Failed to fetch dashboard data");
      const result = await response.json();
      if (result.success) {
        setData(result);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500">Loading dashboard...</div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {adminRole === "global" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Department
              </label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Departments</option>
                {/* Departments would be fetched and populated here */}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Emergency Alerts */}
      {data?.emergencyAlerts && data.emergencyAlerts.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Emergency Alerts ({data.emergencyAlerts.length})
          </h2>
          <div className="space-y-3">
            {data.emergencyAlerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-red-50 border border-red-200 rounded-lg p-4"
              >
                <p className="font-semibold text-red-900">
                  {alert.first_name} {alert.last_name} (ID: {alert.patient_id})
                </p>
                <p className="text-sm text-red-700 mt-1">
                  Department: {alert.to_department_name}
                </p>
                <p className="text-sm text-red-700">
                  By: {alert.transferred_by}
                </p>
                <p className="text-xs text-red-600 mt-2">
                  {new Date(alert.transferred_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Transfers */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Patient Transfers ({data?.allTransfers?.length || 0})
        </h2>
        {data?.allTransfers && data.allTransfers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Patient
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    From
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    To
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Staff
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.allTransfers.map((transfer) => (
                  <tr key={transfer.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {transfer.first_name} {transfer.last_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {transfer.from_department_name || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {transfer.to_department_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {transfer.transferred_by}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(transfer.transferred_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center py-8 text-gray-500">No transfers found</p>
        )}
      </div>

      {/* Issue Reports */}
      {data?.issueReports && data.issueReports.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Issue Reports ({data.issueReports.length})
          </h2>
          <div className="space-y-3">
            {data.issueReports.map((report) => (
              <div
                key={report.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {report.description}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Department: {report.department_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Reported by: {report.reported_by_name}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      report.severity === "critical"
                        ? "bg-red-100 text-red-800"
                        : report.severity === "high"
                        ? "bg-orange-100 text-orange-800"
                        : report.severity === "medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {report.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Department Durations */}
      {data?.departmentDurations && data.departmentDurations.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Department Statistics
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Patients
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Avg Duration
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Max Duration
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.departmentDurations.map((dept) => (
                  <tr key={dept.department_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {dept.department_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {dept.patient_count}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {Math.round(dept.avg_duration_minutes || 0)} min
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {Math.round(dept.max_duration_minutes || 0)} min
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
