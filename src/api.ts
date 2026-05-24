import { activities as seedActivities, customers as seedCustomers, deals as seedDeals, tasks as seedTasks } from "./mockData";
import { Activity, Customer, CustomerStatus, DashboardSnapshot, Task, TaskStatus } from "./types";

const latency = 280;

function cloneSnapshot(): DashboardSnapshot {
  return {
    customers: structuredClone(seedCustomers),
    deals: structuredClone(seedDeals),
    tasks: structuredClone(seedTasks),
    activities: structuredClone(seedActivities),
  };
}

function wait<T>(value: T, delay = latency): Promise<T> {
  return new Promise((resolve) => window.setTimeout(() => resolve(value), delay));
}

class MockCrmApi {
  private snapshot = cloneSnapshot();

  async getDashboard(): Promise<DashboardSnapshot> {
    return wait(structuredClone(this.snapshot), 480);
  }

  async updateCustomerStatus(customerId: string, status: CustomerStatus): Promise<Customer> {
    const customer = this.snapshot.customers.find((item) => item.id === customerId);
    if (!customer) {
      throw new Error("Customer not found");
    }

    customer.status = status;
    customer.lastTouch = "Just now";
    customer.health = status === "At Risk" ? "Blocked" : customer.health === "Blocked" ? "Needs Follow-up" : customer.health;
    customer.probability = status === "Won" ? 100 : status === "Proposal" ? Math.max(customer.probability, 64) : customer.probability;

    const deal = this.snapshot.deals.find((item) => item.customerId === customerId);
    if (deal) {
      deal.stage = status;
    }

    this.addActivity(customerId, {
      type: "System",
      title: `Status changed to ${status}`,
      detail: "Mock API updated the customer record, related deal stage, and activity timeline.",
    });

    return wait(structuredClone(customer));
  }

  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<Task> {
    const task = this.snapshot.tasks.find((item) => item.id === taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    task.status = status;
    this.addActivity(task.customerId, {
      type: "System",
      title: `Task marked ${status}`,
      detail: task.title,
    });

    return wait(structuredClone(task));
  }

  async addNote(customerId: string, detail: string): Promise<Activity> {
    const activity = this.addActivity(customerId, {
      type: "Note",
      title: "Internal note added",
      detail,
    });

    return wait(structuredClone(activity), 220);
  }

  async createSampleOpportunity(): Promise<Customer> {
    const customerId = `cus-${crypto.randomUUID()}`;
    const dealId = `deal-${crypto.randomUUID()}`;
    const taskId = `task-${crypto.randomUUID()}`;

    const customer: Customer = {
      id: customerId,
      company: "Atlas Studio",
      contactName: "Priya Shah",
      email: "priya@atlasstudio.example",
      segment: "Agency",
      status: "Lead",
      value: 9800,
      probability: 28,
      owner: "Ji",
      lastTouch: "Just now",
      nextStep: "Qualify automation requirements",
      health: "Healthy",
    };

    this.snapshot.customers = [customer, ...this.snapshot.customers];
    this.snapshot.deals = [
      {
        id: dealId,
        customerId,
        title: "Operations automation sprint",
        stage: "Lead",
        amount: customer.value,
        closeDate: "Jul 15",
      },
      ...this.snapshot.deals,
    ];
    this.snapshot.tasks = [
      {
        id: taskId,
        customerId,
        title: "Send discovery questionnaire",
        owner: "Ji",
        priority: "Medium",
        status: "Open",
        dueDate: "Tomorrow",
      },
      ...this.snapshot.tasks,
    ];
    this.addActivity(customerId, {
      type: "System",
      title: "New opportunity created",
      detail: "Mock API created a customer record, deal, task, and audit event.",
    });

    return wait(structuredClone(customer), 260);
  }

  private addActivity(customerId: string, activity: Omit<Activity, "id" | "customerId" | "createdAt">): Activity {
    const nextActivity: Activity = {
      id: `act-${crypto.randomUUID()}`,
      customerId,
      createdAt: "Just now",
      ...activity,
    };

    this.snapshot.activities = [nextActivity, ...this.snapshot.activities];
    return nextActivity;
  }
}

export const crmApi = new MockCrmApi();
