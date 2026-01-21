"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import IssueReportDialog from "./IssueReportDialog";

export default function IssueReportButton({
  departmentId,
  patientId,
  onReportSubmitted,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleReportSubmitted = () => {
    setIsOpen(false);
    if (onReportSubmitted) {
      onReportSubmitted();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2"
      >
        <AlertTriangle className="w-4 h-4" />
        Report Issue
      </button>

      {isOpen && (
        <IssueReportDialog
          departmentId={departmentId}
          patientId={patientId}
          onClose={() => setIsOpen(false)}
          onSubmit={handleReportSubmitted}
        />
      )}
    </>
  );
}
