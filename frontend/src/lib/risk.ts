
export const analyzeRisk = (amount: number, recipient: string) => {
  if (amount > 10000) return "high";
  if (recipient.toLowerCase().includes("crypto")) return "medium";
  return "low";
};

export const getRiskColor = (risk: string) => {
  switch (risk) {
    case "high":
      return "text-red-500";
    case "medium":
      return "text-yellow-500";
    case "low":
    default:
      return "text-green-500";
  }
};
