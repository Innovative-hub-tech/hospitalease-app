"use client";

import { useEffect, useState } from "react";
import { X, AlertCircle } from "lucide-react";

export default function TransferDialog({
  patientId,
  currentDepartmentId,
  onClose,
  onTransferComplete,
}) {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [notes, setNotes] = useState("");
  const [isEmergency, setIsEmergency] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/departments");
      if (!response.ok) throw new Error("Failed to fetch departments");
      const data = await response.json();
      if (data.success) {
        // Filter out current department
        const filtered = data.departments.filter(
          (dept) => dept.id !== currentDepartmentId
        );
        setDepartments(filtered);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!selectedDepartment) {
      setError("Please select a destination department");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/workflow/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patientId,
          to_department_id: selectedDepartment,
          notes: notes || null,
          is_emergency: isEmergency,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to transfer patient");
      }

      const data = await response.json();
      if (data.success) {
        alert("Patient transferred successfully");
        onTransferComplete();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Transfer Patient</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Loading departments...
            </div>
          ) : (
            <>
              {/* Department Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Destination Department
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select a department...</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this transfer..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows="3"
                />
              </div>

              {/* Emergency Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="emergency"
                  checked={isEmergency}
                  onChange={(e) => setIsEmergency(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                />
                <label htmlFor="emergency" className="text-sm font-medium text-gray-700">
                  Mark as Emergency
                </label>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleTransfer}
            disabled={submitting || loading}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
          >
            {submitting ? "Transferring..." : "Transfer"}
          </button>
        </div>
      </div>
    </div>
  );
}
