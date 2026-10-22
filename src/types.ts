export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  nominalCalculation?: AllocationResult[];
}

export interface AllocationResult {
  key: string;
  label: string;
  pct: number;
  desc: string;
  color: string;
  allocatedValue: number;
  analogy: string;
}

export interface APBNStat {
  label: string;
  amount: string;
  description: string;
  badge?: string;
  subItems?: { label: string; amount: string }[];
}
