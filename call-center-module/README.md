# Call Center Module for SBC Core

Standalone Call Center module — agent queues, tickets, SLA routing, and call logging.

## Package Format

This module follows the SBC Core external module specification.
A valid `.zip` package must contain:

```text
call_center-1.0.0.zip
├── manifest.json
└── migrations/
    ├── 0001_*.sql
    ├── 0002_*.sql
    ├── 0003_*.sql
    └── 0004_*.sql
```

## How to Build & Install

### 1. Install dependencies

```bash
pnpm install
```

### 2. Build the zip

```bash
node scripts/build-zip.mjs
# -> dist/call_center-1.0.0.zip
```

### 3. Install in SBC Core

1. Open SBC Core -> Marketplace
2. Click Upload Module
3. Drop `dist/call_center-1.0.0.zip`
4. After upload completes, click Install on the Call Center card

## Capabilities

- Queue setup for support, inbound sales, and escalation lines
- Agent roster management with queue membership and availability flags
- Ticket intake, assignment, prioritization, and closure tracking
- Call logging with duration, outcome, and optional recording metadata
- SLA target tracking for response and resolution workflows

## Tables Created

| Table | Description |
|---|---|
| `call_center_queues` | Queue definitions and routing rules |
| `call_center_agents` | Agent profiles and queue membership |
| `call_center_tickets` | Support and call follow-up tickets |
| `call_center_calls` | Call log and outcome history |

## Permissions Registered

| Key | Description |
|---|---|
| `call_center.view` | View call center records |
| `call_center.queue.manage` | Create and manage queues |
| `call_center.agent.manage` | Create and manage agents |
| `call_center.ticket.create` | Create tickets |
| `call_center.ticket.update` | Update tickets |
| `call_center.ticket.assign` | Assign tickets |
| `call_center.ticket.close` | Close tickets |
| `call_center.call.log` | Log and review calls |
| `call_center.report.view` | View reports and dashboards |

## Menu Structure

```text
Call Center
├── Queues     /call-center/queues
├── Tickets    /call-center/tickets
├── Calls      /call-center/calls
└── Reports    /call-center/reports
```

## Developing Your Own Module

1. Copy this directory
2. Edit `manifest.json`
3. Write SQL migrations in `migrations/`
4. Run `node scripts/build-zip.mjs`
5. Upload the zip to SBC Core Marketplace
