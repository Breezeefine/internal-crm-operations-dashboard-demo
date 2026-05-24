import {
  Activity,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  ClipboardList,
  Clock3,
  Database,
  Filter,
  LayoutDashboard,
  Loader2,
  Mail,
  PanelRightOpen,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  UsersRound,
  Workflow,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, RefObject } from "react";
import { crmApi } from "./api";
import { Customer, CustomerStatus, DashboardMetric, DashboardSnapshot, TaskStatus } from "./types";

const statusOrder: CustomerStatus[] = ["Lead", "Qualified", "Proposal", "Won", "At Risk"];
const taskStatusOptions: TaskStatus[] = ["Open", "In Progress", "Done"];
type NavSection = "dashboard" | "pipeline" | "customers" | "tasks" | "architecture";

const statusClasses: Record<CustomerStatus, string> = {
  Lead: "status lead",
  Qualified: "status qualified",
  Proposal: "status proposal",
  Won: "status won",
  "At Risk": "status risk",
};

const healthClasses: Record<Customer["health"], string> = {
  Healthy: "health healthy",
  "Needs Follow-up": "health followup",
  Blocked: "health blocked",
};

const priorityClasses = {
  High: "priority high",
  Medium: "priority medium",
  Low: "priority low",
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
};

function buildMetrics(snapshot: DashboardSnapshot): DashboardMetric[] {
  const openPipeline = snapshot.deals
    .filter((deal) => deal.stage !== "Won")
    .reduce((total, deal) => total + deal.amount, 0);
  const activeLeads = snapshot.customers.filter((customer) => customer.status !== "Won").length;
  const openTasks = snapshot.tasks.filter((task) => task.status !== "Done").length;
  const riskAccounts = snapshot.customers.filter((customer) => customer.status === "At Risk" || customer.health === "Blocked").length;

  return [
    {
      label: "Open pipeline",
      value: formatCurrency(openPipeline),
      detail: "weighted customer opportunities",
      trend: "+18% this month",
      tone: "blue",
    },
    {
      label: "Active accounts",
      value: String(activeLeads),
      detail: "leads and open deals",
      trend: "3 need follow-up",
      tone: "green",
    },
    {
      label: "Open tasks",
      value: String(openTasks),
      detail: "across sales and delivery",
      trend: "2 due today",
      tone: "amber",
    },
    {
      label: "SLA risk",
      value: String(riskAccounts),
      detail: "blocked or at-risk accounts",
      trend: "requires owner action",
      tone: "red",
    },
  ];
}

function AppShellLoading() {
  return (
    <div className="loading-screen">
      <Loader2 size={34} aria-hidden="true" />
      <strong>Loading CRM workspace</strong>
      <span>Fetching customers, tasks, activity, and pipeline data from the mock API.</span>
    </div>
  );
}

export function App() {
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState("cus-aurora");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | "All">("All");
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState("Mock API connected");
  const [noteDraft, setNoteDraft] = useState("");
  const [activeSection, setActiveSection] = useState<NavSection>("dashboard");
  const [highlightedSection, setHighlightedSection] = useState<NavSection | null>(null);
  const dashboardRef = useRef<HTMLElement | null>(null);
  const pipelineRef = useRef<HTMLElement | null>(null);
  const customersRef = useRef<HTMLElement | null>(null);
  const tasksRef = useRef<HTMLElement | null>(null);
  const architectureRef = useRef<HTMLElement | null>(null);

  const sectionRefs: Record<NavSection, RefObject<HTMLElement | null>> = {
    dashboard: dashboardRef,
    pipeline: pipelineRef,
    customers: customersRef,
    tasks: tasksRef,
    architecture: architectureRef,
  };

  useEffect(() => {
    let isMounted = true;

    crmApi.getDashboard().then((data) => {
      if (isMounted) {
        setSnapshot(data);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const metrics = useMemo(() => (snapshot ? buildMetrics(snapshot) : []), [snapshot]);

  const selectedCustomer = useMemo(() => {
    return snapshot?.customers.find((customer) => customer.id === selectedCustomerId) ?? snapshot?.customers[0];
  }, [selectedCustomerId, snapshot]);

  const selectedTasks = useMemo(() => {
    return snapshot?.tasks.filter((task) => task.customerId === selectedCustomer?.id) ?? [];
  }, [selectedCustomer?.id, snapshot]);

  const selectedActivities = useMemo(() => {
    return snapshot?.activities.filter((activity) => activity.customerId === selectedCustomer?.id) ?? [];
  }, [selectedCustomer?.id, snapshot]);

  const filteredCustomers = useMemo(() => {
    if (!snapshot) {
      return [];
    }

    return snapshot.customers.filter((customer) => {
      const matchesStatus = statusFilter === "All" || customer.status === statusFilter;
      const normalizedQuery = query.trim().toLowerCase();
      const matchesQuery =
        normalizedQuery.length === 0 ||
        `${customer.company} ${customer.contactName} ${customer.email} ${customer.segment} ${customer.owner}`
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [query, snapshot, statusFilter]);

  if (!snapshot || !selectedCustomer) {
    return <AppShellLoading />;
  }

  function handleNavClick(section: NavSection) {
    setActiveSection(section);
    setHighlightedSection(section);
    sectionRefs[section].current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest",
    });

    window.setTimeout(() => {
      setHighlightedSection((current) => (current === section ? null : current));
    }, 1400);
  }

  async function refreshDashboard(message = "Dashboard refreshed") {
    const data = await crmApi.getDashboard();
    setSnapshot(data);
    setToast(message);
  }

  async function handleStatusChange(customerId: string, status: CustomerStatus) {
    setIsSaving(true);
    try {
      await crmApi.updateCustomerStatus(customerId, status);
      await refreshDashboard(`Customer moved to ${status}`);
      setSelectedCustomerId(customerId);
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Customer update failed");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleTaskStatusChange(taskId: string, status: TaskStatus) {
    setIsSaving(true);
    try {
      await crmApi.updateTaskStatus(taskId, status);
      await refreshDashboard(`Task marked ${status}`);
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Task update failed");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateDeal() {
    setIsSaving(true);
    try {
      const customer = await crmApi.createSampleOpportunity();
      await refreshDashboard("Sample opportunity created");
      setSelectedCustomerId(customer.id);
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Opportunity creation failed");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = noteDraft.trim();
    if (!trimmed || !selectedCustomer) {
      return;
    }

    setIsSaving(true);
    try {
      await crmApi.addNote(selectedCustomer.id, trimmed);
      setNoteDraft("");
      await refreshDashboard("Internal note added");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Note save failed");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Workspace navigation">
        <div className="brand">
          <div className="brand-mark">
            <BriefcaseBusiness size={22} aria-hidden="true" />
          </div>
          <div>
            <p>Portfolio demo</p>
            <strong>OpsCRM</strong>
          </div>
        </div>
        <nav className="nav-list">
          <button
            className={activeSection === "dashboard" ? "active" : ""}
            type="button"
            onClick={() => handleNavClick("dashboard")}
          >
            <LayoutDashboard size={18} aria-hidden="true" />
            Dashboard
          </button>
          <button
            className={activeSection === "pipeline" ? "active" : ""}
            type="button"
            onClick={() => handleNavClick("pipeline")}
          >
            <BarChart3 size={18} aria-hidden="true" />
            Pipeline
          </button>
          <button
            className={activeSection === "customers" ? "active" : ""}
            type="button"
            onClick={() => handleNavClick("customers")}
          >
            <UsersRound size={18} aria-hidden="true" />
            Customers
          </button>
          <button
            className={activeSection === "tasks" ? "active" : ""}
            type="button"
            onClick={() => handleNavClick("tasks")}
          >
            <ClipboardList size={18} aria-hidden="true" />
            Tasks
          </button>
          <button
            className={activeSection === "architecture" ? "active" : ""}
            type="button"
            onClick={() => handleNavClick("architecture")}
          >
            <Settings size={18} aria-hidden="true" />
            API
          </button>
        </nav>
        <div className="api-card">
          <div className="api-card-icon">
            <Database size={18} aria-hidden="true" />
          </div>
          <strong>Mock REST API</strong>
          <p>Local service layer simulates GET, PATCH, audit log, and task updates.</p>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <p className="eyebrow">Full-stack style internal tool</p>
            <h1>Internal CRM & Operations Dashboard</h1>
          </div>
          <div className="top-actions">
            <div className="search-box">
              <Search size={17} aria-hidden="true" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search accounts, owners, segment..." />
            </div>
            <button className="secondary-button" type="button" onClick={() => refreshDashboard()} disabled={isSaving}>
              <RefreshCw size={16} aria-hidden="true" />
              Sync
            </button>
          </div>
        </header>

        <section className="status-strip" aria-label="System status">
          <span>
            <ShieldCheck size={16} aria-hidden="true" />
            {toast}
          </span>
          <span>
            <Activity size={16} aria-hidden="true" />
            {isSaving ? "Saving changes..." : "Interactive mock backend"}
          </span>
          <span>
            <Workflow size={16} aria-hidden="true" />
            CRUD + pipeline + audit log
          </span>
        </section>

        <section
          id="dashboard"
          ref={dashboardRef}
          className={`metric-grid section-target ${highlightedSection === "dashboard" ? "section-highlight" : ""}`}
          aria-label="Dashboard metrics"
        >
          {metrics.map((metric) => (
            <article className={`metric-card ${metric.tone}`} key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <p>{metric.detail}</p>
              <small>{metric.trend}</small>
            </article>
          ))}
        </section>

        <section
          id="pipeline"
          ref={pipelineRef}
          className={`panel pipeline-panel section-target ${highlightedSection === "pipeline" ? "section-highlight" : ""}`}
        >
          <div className="panel-header">
            <div>
              <p className="eyebrow">Sales pipeline</p>
              <h2>Deal stages and account movement</h2>
            </div>
            <button className="secondary-button" type="button" onClick={handleCreateDeal} disabled={isSaving}>
              <Plus size={16} aria-hidden="true" />
              New deal
            </button>
          </div>
          <div className="pipeline-board">
            {statusOrder.map((status) => {
              const deals = snapshot.deals.filter((deal) => deal.stage === status);
              const total = deals.reduce((sum, deal) => sum + deal.amount, 0);

              return (
                <article className="pipeline-column" key={status}>
                  <div className="pipeline-column-header">
                    <span className={statusClasses[status]}>{status}</span>
                    <strong>{formatCurrency(total)}</strong>
                  </div>
                  <div className="pipeline-deals">
                    {deals.map((deal) => {
                      const customer = snapshot.customers.find((item) => item.id === deal.customerId);
                      return (
                        <button className="deal-row" key={deal.id} type="button" onClick={() => setSelectedCustomerId(deal.customerId)}>
                          <strong>{deal.title}</strong>
                          <span>{customer?.company}</span>
                          <small>
                            {formatCurrency(deal.amount)} - {deal.closeDate}
                          </small>
                        </button>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section
          id="customers"
          ref={customersRef}
          className={`panel table-panel section-target ${highlightedSection === "customers" ? "section-highlight" : ""}`}
        >
          <div className="panel-header">
            <div>
              <p className="eyebrow">Customer records</p>
              <h2>Lead and account management</h2>
            </div>
            <div className="filter-row">
              <Filter size={16} aria-hidden="true" />
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as CustomerStatus | "All")}>
                <option value="All">All statuses</option>
                {statusOrder.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Account</th>
                  <th>Segment</th>
                  <th>Status</th>
                  <th>Owner</th>
                  <th>Value</th>
                  <th>Next step</th>
                  <th>Update</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr className={customer.id === selectedCustomer.id ? "selected" : ""} key={customer.id}>
                    <td>
                      <button className="account-button" type="button" onClick={() => setSelectedCustomerId(customer.id)}>
                        <Building2 size={16} aria-hidden="true" />
                        <span>
                          <strong>{customer.company}</strong>
                          <small>{customer.contactName}</small>
                        </span>
                      </button>
                    </td>
                    <td>{customer.segment}</td>
                    <td>
                      <span className={statusClasses[customer.status]}>{customer.status}</span>
                    </td>
                    <td>{customer.owner}</td>
                    <td>{formatCurrency(customer.value)}</td>
                    <td>{customer.nextStep}</td>
                    <td>
                      <select
                        className="inline-select"
                        value={customer.status}
                        onChange={(event) => handleStatusChange(customer.id, event.target.value as CustomerStatus)}
                        disabled={isSaving}
                        aria-label={`Update ${customer.company} status`}
                      >
                        {statusOrder.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <aside className="detail-panel" aria-label="Selected customer details">
        <div className="detail-header">
          <div>
            <p className="eyebrow">Selected account</p>
            <h2>{selectedCustomer.company}</h2>
          </div>
          <PanelRightOpen size={20} aria-hidden="true" />
        </div>

        <section className="detail-section customer-summary">
          <div className="contact-avatar">
            <UserRound size={22} aria-hidden="true" />
          </div>
          <div>
            <strong>{selectedCustomer.contactName}</strong>
            <span>
              <Mail size={14} aria-hidden="true" />
              {selectedCustomer.email}
            </span>
          </div>
        </section>

        <section className="detail-section">
          <div className="detail-kv">
            <span>Status</span>
            <strong className={statusClasses[selectedCustomer.status]}>{selectedCustomer.status}</strong>
          </div>
          <div className="detail-kv">
            <span>Health</span>
            <strong className={healthClasses[selectedCustomer.health]}>{selectedCustomer.health}</strong>
          </div>
          <div className="detail-kv">
            <span>Owner</span>
            <strong>{selectedCustomer.owner}</strong>
          </div>
          <div className="detail-kv">
            <span>Probability</span>
            <strong>{selectedCustomer.probability}%</strong>
          </div>
        </section>

        <section
          id="tasks"
          ref={tasksRef}
          className={`detail-section section-target ${highlightedSection === "tasks" ? "section-highlight" : ""}`}
        >
          <div className="detail-section-header">
            <div>
              <p className="eyebrow">Task queue</p>
              <h3>Operational next steps</h3>
            </div>
            <SlidersHorizontal size={18} aria-hidden="true" />
          </div>
          <div className="task-list">
            {selectedTasks.map((task) => (
              <article className="task-item" key={task.id}>
                <div>
                  <strong>{task.title}</strong>
                  <span>
                    <CalendarClock size={14} aria-hidden="true" />
                    {task.dueDate} - {task.owner}
                  </span>
                </div>
                <div className="task-controls">
                  <span className={priorityClasses[task.priority]}>{task.priority}</span>
                  <select
                    value={task.status}
                    onChange={(event) => handleTaskStatusChange(task.id, event.target.value as TaskStatus)}
                    disabled={isSaving}
                    aria-label={`Update task ${task.title}`}
                  >
                    {taskStatusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="detail-section">
          <div className="detail-section-header">
            <div>
              <p className="eyebrow">Activity timeline</p>
              <h3>Audit log and notes</h3>
            </div>
            <Clock3 size={18} aria-hidden="true" />
          </div>
          <div className="timeline">
            {selectedActivities.map((activity) => (
              <article className="timeline-item" key={activity.id}>
                <span className="timeline-dot" />
                <div>
                  <strong>{activity.title}</strong>
                  <p>{activity.detail}</p>
                  <small>{activity.type} - {activity.createdAt}</small>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="detail-section note-section">
          <form onSubmit={handleAddNote}>
            <label htmlFor="note">Add internal note</label>
            <textarea
              id="note"
              value={noteDraft}
              onChange={(event) => setNoteDraft(event.target.value)}
              placeholder="Write a note that will be saved through the mock API..."
            />
            <button type="submit" disabled={!noteDraft.trim() || isSaving}>
              <Send size={16} aria-hidden="true" />
              Save note
            </button>
          </form>
        </section>

        <section
          className={`architecture-panel section-target ${highlightedSection === "architecture" ? "section-highlight" : ""}`}
          id="architecture"
          ref={architectureRef}
        >
          <Sparkles size={18} aria-hidden="true" />
          <div>
            <strong>Full-stack signal</strong>
            <p>Typed models, mock API mutations, dashboard state, pipeline updates, task workflow, and audit log behavior.</p>
          </div>
        </section>
      </aside>
    </div>
  );
}
