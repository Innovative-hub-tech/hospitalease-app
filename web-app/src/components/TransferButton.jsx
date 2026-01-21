"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import TransferDialog from "./TransferDialog";

export default function TransferButton({
  patientId,
  currentDepartmentId,
  onTransferComplete,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleTransferComplete = () => {
    setIsOpen(false);
    if (onTransferComplete) {
      onTransferComplete();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        disabled={isLoading}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 disabled:opacity-50"
      >
        <ArrowRight className="w-4 h-4" />
        Transfer
      </button>

      {isOpen && (
        <TransferDialog
          patientId={patientId}
          currentDepartmentId={currentDepartmentId}
          onClose={() => setIsOpen(false)}
          onTransferComplete={handleTransferComplete}
        />
      )}
    </>
  );
}
