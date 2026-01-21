"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";

export default function TransferHistory({ patientId }) {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTransferHistory();
  }, [patientId]);

  const fetchTransferHistory = async () => {
    try {
      const response = await fetch(
        `/api/workflow/history?patient_id=${patientId}`
      );
      if (!response.ok) throw new Error("Failed to fetch transfer history");
      const data = await response.json();
      if (data.success) {
        setTransfers(data.workflow || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
          Transfer History
        </h2>
        <div className="text-center py-8 text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
          Transfer History
        </h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (transfers.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
          Transfer History
        </h2>
        <p className="text-center py-8 text-gray-500">No transfers yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
        Transfer History
      </h2>
      <div className="space-y-4">
        {transfers.map((transfer) => (
          <div
            key={transfer.id}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-gray-900">
                  {transfer.from_department_name || "Initial"} →{" "}
                  {transfer.to_department_name}
                </p>
                <p className="text-sm text-gray-600">
                  By: {transfer.transferred_by}
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                {transfer.action_type}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              {new Date(transfer.transferred_at).toLocaleString()}
            </p>
            {transfer.notes && (
              <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                {transfer.notes}
              </p>
            )}
            {transfer.is_emergency && (
              <div className="mt-2 text-xs font-semibold text-red-600 bg-red-50 p-2 rounded">
                🚨 Emergency Transfer
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
