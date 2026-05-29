# CRM Module for SBC Core

Standalone CRM module — customers, leads, and sales pipelines.

## Package Format

This module follows the SBC Core external module specification.
A valid `.zip` package must contain:

```
crm-1.0.0.zip
├── manifest.json       ← required: module identity, permissions, menus
└── migrations/
    ├── 0001_*.sql      ← ordered SQL migrations (run on install)
    ├── 0002_*.sql
    └── 0003_*.sql
```

## How to Build & Install

### 1. Install dependencies

```bash
npm install
```

### 2. Build the zip

```bash
node scripts/build-zip.mjs
# → dist/crm-1.0.0.zip
```

### 3. Install in SBC Core

1. Open **SBC Core → Marketplace**
2. Click **Upload Module**
3. Drop `dist/crm-1.0.0.zip`
4. After upload completes, click **Install** on the CRM card

## Tables Created

| Table | Description |
|---|---|
| `crm_customers` | People and organizations |
| `crm_leads` | Sales opportunities |
| `crm_pipelines` | Named pipeline definitions |
| `crm_pipeline_stages` | Stages within a pipeline |

## Permissions Registered

| Key | Description |
|---|---|
| `crm.view` | View all CRM records |
| `crm.customer.create` | Create customers |
| `crm.customer.update` | Edit customers |
| `crm.customer.delete` | Delete customers |
| `crm.lead.create` | Create leads |
| `crm.lead.update` | Edit leads |
| `crm.lead.delete` | Delete leads |
| `crm.lead.convert` | Convert a lead to customer |
| `crm.pipeline.manage` | Manage pipelines and stages |
| `crm.export` | Export CRM data |

## Menu Structure

```
CRM
├── Customers    /crm/customers
├── Leads        /crm/leads
└── Pipelines    /crm/pipelines
```

## Developing Your Own Module

Use this repository as a template:

1. Copy this directory
2. Edit `manifest.json` — change `name`, `title`, `permissions`, `menus`
3. Write SQL migrations in `migrations/`
4. Run `node scripts/build-zip.mjs`
5. Upload the zip to SBC Core Marketplace
