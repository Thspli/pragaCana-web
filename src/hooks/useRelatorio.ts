"use client";

import { useState } from "react";

export function useRelatorio() {
  const [isCreatingReport, setIsCreatingReport] = useState(false);
  const [reportText, setReportText] = useState("");

  const handleSaveReport = (talhaoNome: string) => {
    console.log("Relatório:", talhaoNome, reportText);
    alert(`Relatório para "${talhaoNome}" salvo!`);
    setIsCreatingReport(false);
    setReportText("");
  };

  return {
    isCreatingReport,
    setIsCreatingReport,
    reportText,
    setReportText,
    handleSaveReport,
  };
}
