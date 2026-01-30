
export interface FraudAlert {
  id: string;
  user: string;
  avatarSeed: string;
  type: "Phishing" | "Vishing" | "UPI Fraud" | "Job Scam" | "Identity Theft";
  content: string;
  location?: string;
  trustScore: number; // Net upvotes
  verified: boolean;
  timestamp: string;
  comments: number;
}

export const fraudAlerts: FraudAlert[] = [
  {
    id: "1",
    user: "Rahul V.",
    avatarSeed: "Rahul",
    type: "UPI Fraud",
    content: "Received a 'Cashback Received' request on GPay from 'Shopify-Refunds'. It was actually a REQUEST to pay ₹2000. Be careful!",
    location: "Mumbai",
    trustScore: 342,
    verified: true,
    timestamp: "2h ago",
    comments: 45
  },
  {
    id: "2",
    user: "Sneha G.",
    avatarSeed: "Sneha",
    type: "Phishing",
    content: "Fake SBI KYC link via SMS from +91-98... asking to update PAN. The link is sbi-update-kyc.com (FAKE).",
    location: "Delhi NCR",
    trustScore: 890,
    verified: true,
    timestamp: "5h ago",
    comments: 120
  },
  {
    id: "3",
    user: "Arjun K.",
    avatarSeed: "Arjun",
    type: "Job Scam",
    content: "Part-time job offer: 'Like YouTube videos and earn ₹5000/day'. They asked for a registration fee of ₹1000.",
    location: "Bangalore",
    trustScore: 156,
    verified: false,
    timestamp: "8h ago",
    comments: 12
  },
  {
    id: "4",
    user: "Priya S.",
    avatarSeed: "Priya",
    type: "Vishing",
    content: "Call from 'Customs Offical' claiming a parcel with drugs is detained. Asked for Skype ID. It's a classic FedEx scam.",
    location: "Hyderabad",
    trustScore: 420,
    verified: true,
    timestamp: "1d ago",
    comments: 67
  }
];

export const trendingScams = [
  { id: 1, name: "FedEx Parcel Scam", growth: "+120%" },
  { id: 2, name: "Fake Electricity Bill SMS", growth: "+85%" },
  { id: 3, name: "YouTube Like Job", growth: "+60%" },
  { id: 4, name: "Deepfake Video Calls", growth: "+45%" },
];
