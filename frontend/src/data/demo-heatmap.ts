
export interface RegionData {
  id: string;
  name: string;
  riskScore: number; // 0-100
  transactionVolume: number;
  fraudCases: number;
  coordinates: { x: number; y: number }; // Percentage % from top-left
}

export const regionalRiskData: RegionData[] = [
  { id: 'DEL', name: 'Delhi NCR', riskScore: 85, transactionVolume: 125000, fraudCases: 420, coordinates: { x: 30, y: 25 } },
  { id: 'MUM', name: 'Mumbai', riskScore: 78, transactionVolume: 180000, fraudCases: 350, coordinates: { x: 20, y: 55 } },
  { id: 'BLR', name: 'Bengaluru', riskScore: 65, transactionVolume: 150000, fraudCases: 120, coordinates: { x: 40, y: 75 } },
  { id: 'HYD', name: 'Hyderabad', riskScore: 55, transactionVolume: 90000, fraudCases: 85, coordinates: { x: 45, y: 60 } },
  { id: 'CHE', name: 'Chennai', riskScore: 45, transactionVolume: 85000, fraudCases: 60, coordinates: { x: 50, y: 80 } },
  { id: 'KOL', name: 'Kolkata', riskScore: 60, transactionVolume: 70000, fraudCases: 95, coordinates: { x: 75, y: 45 } },
  { id: 'JAI', name: 'Jaipur', riskScore: 92, transactionVolume: 45000, fraudCases: 150, coordinates: { x: 25, y: 35 } }, // High fraud simulation
  { id: 'AHM', name: 'Ahmedabad', riskScore: 40, transactionVolume: 60000, fraudCases: 30, coordinates: { x: 15, y: 40 } },
];

export const heatmapData = [
  { name: "Mon", value: 40, risk: "low" },
  { name: "Tue", value: 30, risk: "low" },
  { name: "Wed", value: 20, risk: "low" },
  { name: "Thu", value: 70, risk: "high" },
  { name: "Fri", value: 50, risk: "medium" },
  { name: "Sat", value: 90, risk: "high" },
  { name: "Sun", value: 10, risk: "low" },
];
