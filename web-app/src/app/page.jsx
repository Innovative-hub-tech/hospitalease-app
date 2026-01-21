"use client";

import { Activity } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-600 to-blue-900 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-8 flex justify-center">
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl">
            <Activity className="w-16 h-16 text-blue-600" strokeWidth={2} />
          </div>
        </div>

        <h1 className="text-5xl font-bold text-white mb-4 font-inter">
          HospitalEase
        </h1>
        <p className="text-xl text-blue-100 mb-12 max-w-md mx-auto">
          Streamline your hospital operations with our comprehensive Patient
          Management System
        </p>

        <button
          onClick={() => (window.location.href = "/dashboard")}
          className="bg-white text-blue-700 px-10 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
        >
          Enter
        </button>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
            <div className="text-2xl font-bold">Reception</div>
            <div className="text-sm text-blue-100">Front Desk</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
            <div className="text-2xl font-bold">Vitals</div>
            <div className="text-sm text-blue-100">Monitoring</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
            <div className="text-2xl font-bold">Laboratory</div>
            <div className="text-sm text-blue-100">Diagnostics</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
            <div className="text-2xl font-bold">Pharmacy</div>
            <div className="text-sm text-blue-100">Medications</div>
          </div>
        </div>
      </div>
    </div>
  );
}
