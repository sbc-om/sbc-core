export const overviewMetrics = [
  { label: "Open Tickets", value: "84", hint: "12 breaching SLA" },
  { label: "Agents Online", value: "19", hint: "4 on break" },
  { label: "Calls Today", value: "412", hint: "+9% vs yesterday" },
  { label: "SLA Hit Rate", value: "93.4%", hint: "Target 90%" },
] as const;

export const queues = [
  { name: "General Support", code: "support", channel: "voice", strategy: "round robin", activeAgents: 8, openTickets: 24, slaFirstResponseMin: 10, slaResolutionMin: 60, status: "active" },
  { name: "VIP Desk", code: "vip", channel: "voice", strategy: "priority", activeAgents: 4, openTickets: 7, slaFirstResponseMin: 5, slaResolutionMin: 30, status: "active" },
  { name: "Outbound Sales", code: "sales", channel: "voice", strategy: "least busy", activeAgents: 5, openTickets: 11, slaFirstResponseMin: 20, slaResolutionMin: 180, status: "active" },
  { name: "Escalations", code: "escalation", channel: "omnichannel", strategy: "priority", activeAgents: 2, openTickets: 5, slaFirstResponseMin: 15, slaResolutionMin: 45, status: "active" },
] as const;

export const agents = [
  { name: "Ava Patel", queue: "General Support", extension: "2104", skill: "senior", status: "available", utilization: "71%", todayCalls: 28 },
  { name: "Noah Kim", queue: "VIP Desk", extension: "2112", skill: "senior", status: "busy", utilization: "88%", todayCalls: 16 },
  { name: "Lina Torres", queue: "Outbound Sales", extension: "2145", skill: "standard", status: "available", utilization: "63%", todayCalls: 22 },
  { name: "Mason Reed", queue: "Escalations", extension: "2190", skill: "senior", status: "break", utilization: "54%", todayCalls: 9 },
] as const;

export const tickets = [
  { code: "CC-1042", subject: "Callback request after dropped activation call", queue: "General Support", assignee: "Ava Patel", priority: "high", status: "open", slaDue: "14 min" },
  { code: "CC-1041", subject: "VIP policy renewal issue needs same-day resolution", queue: "VIP Desk", assignee: "Noah Kim", priority: "urgent", status: "pending", slaDue: "8 min" },
  { code: "CC-1038", subject: "Missed outbound follow-up for enterprise quote", queue: "Outbound Sales", assignee: "Lina Torres", priority: "medium", status: "open", slaDue: "42 min" },
  { code: "CC-1033", subject: "Escalated complaint awaiting supervisor approval", queue: "Escalations", assignee: "Mason Reed", priority: "high", status: "resolved", slaDue: "Met" },
] as const;

export const calls = [
  { direction: "Inbound", queue: "General Support", agent: "Ava Patel", number: "+1 415 555 0182", duration: "08:43", outcome: "connected", startedAt: "09:12" },
  { direction: "Inbound", queue: "VIP Desk", agent: "Noah Kim", number: "+971 50 555 8100", duration: "05:12", outcome: "connected", startedAt: "09:18" },
  { direction: "Outbound", queue: "Outbound Sales", agent: "Lina Torres", number: "+44 20 7946 0123", duration: "03:20", outcome: "voicemail", startedAt: "09:25" },
  { direction: "Inbound", queue: "Escalations", agent: "Mason Reed", number: "+1 212 555 0109", duration: "00:00", outcome: "missed", startedAt: "09:31" },
] as const;

export const reportHighlights = [
  { label: "First Response", value: "6m 18s", hint: "Down from 7m 04s" },
  { label: "Resolution Time", value: "38m", hint: "Across 124 tickets" },
  { label: "Abandon Rate", value: "2.8%", hint: "Target below 3%" },
  { label: "CSAT", value: "4.7 / 5", hint: "From 382 surveys" },
] as const;

export const queuePerformance = [
  { queue: "General Support", answered: "96%", resolution: "89%", backlog: 24 },
  { queue: "VIP Desk", answered: "99%", resolution: "97%", backlog: 7 },
  { queue: "Outbound Sales", answered: "91%", resolution: "83%", backlog: 11 },
  { queue: "Escalations", answered: "94%", resolution: "92%", backlog: 5 },
] as const;