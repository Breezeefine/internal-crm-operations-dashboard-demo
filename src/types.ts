export type CustomerStatus = "Lead" | "Qualified" | "Proposal" | "Won" | "At Risk";

export type TaskPriority = "High" | "Medium" | "Low";

export type TaskStatus = "Open" | "In Progress" | "Done";

export type Owner = "Ji" | "Maya" | "Noah" | "Avery";

export type Customer = {
  id: string;
  company: string;
  contactName: string;
  email: string;
  segment: "SaaS" | "Agency" | "Manufacturing" | "Healthcare" | "Education";
  status: CustomerStatus;
  value: number;
  probability: number;
  owner: Owner;
  lastTouch: string;
  nextStep: string;
  health: "Healthy" | "Needs Follow-up" | "Blocked";
};

export type Deal = {
  id: string;
  customerId: string;
  title: string;
  stage: CustomerStatus;
  amount: number;
  closeDate: string;
};

export type Task = {
  id: string;
  customerId: string;
  title: string;
  owner: Owner;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
};

export type Activity = {
  id: string;
  customerId: string;
  type: "Email" | "Call" | "Meeting" | "Note" | "System";
  title: string;
  detail: string;
  createdAt: string;
};

export type DashboardSnapshot = {
  customers: Customer[];
  deals: Deal[];
  tasks: Task[];
  activities: Activity[];
};

export type DashboardMetric = {
  label: string;
  value: string;
  detail: string;
  trend: string;
  tone: "blue" | "green" | "amber" | "red";
};
