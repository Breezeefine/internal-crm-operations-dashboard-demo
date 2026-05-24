# Internal CRM & Operations Dashboard Demo

This is a GitHub Pages and StackBlitz-ready portfolio demo for a full-stack-style internal CRM and operations dashboard.

The demo uses a mock REST API service layer so it can be published publicly without a database or backend server. It still demonstrates the engineering flow a real client would care about: typed data models, dashboard metrics, customer records, pipeline movement, task updates, note creation, and audit log behavior.

## Live demo

```text
https://breezeefine.github.io/internal-crm-operations-dashboard-demo/
```

## Source / browser IDE

```text
https://github.com/Breezeefine/internal-crm-operations-dashboard-demo
https://stackblitz.com/github/Breezeefine/internal-crm-operations-dashboard-demo
```

## Run locally

```powershell
npm install
npm run dev
```

## Demo features

- CRM dashboard metrics
- Customer and lead table with search and status filters
- Deal pipeline by stage
- Customer detail panel
- Task queue with status updates
- Activity timeline and audit log
- Internal note creation
- Mock REST API service layer
- Typed data models for customer, deal, task, and activity records
- Responsive layout for desktop and mobile

## Real project extension

For a paid client project, this demo can be extended with:

- Real backend API using Node.js, Express, FastAPI, or similar
- PostgreSQL, MySQL, Supabase, Firebase, or Airtable storage
- Authentication and role-based access
- CRM, Slack, Google Sheets, Notion, Airtable, HubSpot, or webhook integrations
- CSV import/export and reporting
- Deployment to Vercel, Render, Railway, AWS, or a VPS

## Upwork image assets

Generated upload-ready images are in `upwork-assets/`:

```text
01-cover-internal-crm-dashboard.png
02-pipeline-and-metrics.png
03-customer-records-and-detail.png
04-mobile-responsive-dashboard.png
```

Regenerate them after changing screenshots:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/create-upwork-assets.ps1
```

## Upwork portfolio description

Built a full-stack-style internal CRM and operations dashboard for managing leads, customers, tasks, deal stages, notes, and business activity. The demo uses a mock REST API layer to show how a real backend, database, and workflow logic would connect in a production project.

It demonstrates typed data models, dashboard metrics, customer search and filters, pipeline updates, task status changes, activity logs, and internal notes.

Tech: React, TypeScript, Vite, mock REST API architecture.

## Proposal snippet

Here is a live demo of a similar internal CRM and operations dashboard:

https://breezeefine.github.io/internal-crm-operations-dashboard-demo/

It demonstrates a full-stack-style business tool with customer records, pipeline management, task updates, activity logs, and a mock API layer. For your project, I can connect this type of dashboard to a real backend, database, APIs, CRM, Slack, Google Sheets, Airtable, or other workflow tools.
