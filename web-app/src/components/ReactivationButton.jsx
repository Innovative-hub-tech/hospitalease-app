"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import ReactivationDialog from "./ReactivationDialog";

export default function ReactivationButton({
  patientId,
  patientStatus,
  onReactivationComplete,
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Only show button for discharged or inactive patients
  if (patientStatus !== "discharged" && patientStatus !== "inactive") {
    return null;
  }

  const handleReactivationComplete = () => {
    setIsOpen(false);
    if (onReactivationComplete) {
      onReactivationComplete();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2"
      >
        <RotateCcw className="w-4 h-4" />
        Reactivate
      </button>

      {isOpen && (
        <ReactivationDialog
          patientId={patientId}
          onClose={() => setIsOpen(false)}
          onReactivationComplete={handleReactivationComplete}
        />
      )}
    </>
  );
}
