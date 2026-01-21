"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Edit,
  User,
  Phone,
  Mail,
  Calendar,
  Activity,
  AlertCircle,
} from "lucide-react";
import TransferButton from "@/components/TransferButton";
import ReactivationButton from "@/components/ReactivationButton";
import TransferHistory from "@/components/TransferHistory";
import DepartmentHistory from "@/components/DepartmentHistory";
import IssueReportButton from "@/components/IssueReportButton";

export default function PatientDetailsPage({ params }) {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchPatient();
  }, [params.id, refreshKey]);

  const fetchPatient = async () => {
    try {
      const response = await fetch(`/api/patients/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch patient");
      const data = await response.json();
      if (data.success) {
        setPatient(data.patient);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching patient:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTransferComplete = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleReactivationComplete = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading patient details...</div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">
          Error: {error || "Patient not found"}
        </div>
      </div>
    );
  }

  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => (window.location.href = "/patients")}
                className="hover:bg-white/20 p-2 rounded-lg transition"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold">
                  {patient.first_name} {patient.last_name}
                </h1>
                <p className="text-blue-100">
                  Patient ID: {patient.patient_id}
                </p>
              </div>
            </div>
            <button
              onClick={() =>
                (window.location.href = `/patients/${patient.id}/edit`)
              }
              className="bg-white text-blue-700 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition flex items-center gap-2"
            >
              <Edit className="w-5 h-5" />
              Edit
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-center mb-6">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-blue-600" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span
                    className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold ${
                      patient.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {patient.status}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Patient Type</p>
                  <span
                    className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold ${
                      patient.patient_type === "in-patient"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {patient.patient_type}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {calculateAge(patient.date_of_birth)} years
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {patient.gender}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Blood Group</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {patient.blood_group || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(patient.date_of_birth).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-gray-900 font-medium">{patient.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900 font-medium">
                      {patient.email || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Address</p>
                  <p className="text-gray-900">{patient.address || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                Emergency Contact
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="text-gray-900 font-medium">
                    {patient.emergency_contact_name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-gray-900 font-medium">
                    {patient.emergency_contact_phone || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                Medical Information
              </h2>
              {patient.allergies ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-red-800 mb-1">
                      Allergies
                    </p>
                    <p className="text-red-700">{patient.allergies}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No known allergies</p>
              )}
            </div>

            {/* Admission Details */}
            {patient.patient_type === "in-patient" && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                  Admission Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Admission Date</p>
                    <p className="text-gray-900 font-medium">
                      {new Date(patient.admission_date).toLocaleDateString()}
                    </p>
                  </div>
                  {patient.discharge_date && (
                    <div>
                      <p className="text-sm text-gray-500">Discharge Date</p>
                      <p className="text-gray-900 font-medium">
                        {new Date(patient.discharge_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button
                  onClick={() =>
                    (window.location.href = `/vitals/new?patient_id=${patient.id}`)
                  }
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  <Activity className="w-5 h-5" />
                  Record Vitals
                </button>
                <button
                  onClick={() =>
                    (window.location.href = `/visits/new?patient_id=${patient.id}`)
                  }
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold transition"
                >
                  New Visit
                </button>
                <TransferButton
                  patientId={patient.id}
                  currentDepartmentId={patient.current_department_id}
                  onTransferComplete={handleTransferComplete}
                />
                <ReactivationButton
                  patientId={patient.id}
                  patientStatus={patient.status}
                  onReactivationComplete={handleReactivationComplete}
                />
              </div>
            </div>

            {/* Transfer History */}
            <TransferHistory patientId={patient.id} key={`transfer-${refreshKey}`} />

            {/* Department History */}
            <DepartmentHistory patientId={patient.id} key={`dept-${refreshKey}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
