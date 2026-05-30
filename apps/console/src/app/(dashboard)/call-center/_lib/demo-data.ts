export interface OverviewMetric {
  label: string;
  value: string;
  hint: string;
}

export interface CallCenterQueue {
  name: string;
  code: string;
  channel: string;
  strategy: string;
  activeAgents: number;
  openTickets: number;
  slaFirstResponseMin: number;
  slaResolutionMin: number;
  status: string;
}

export interface CallCenterAgent {
  name: string;
  queue: string;
  extension: string;
  skill: string;
  status: string;
  utilization: string;
  todayCalls: number;
}

export interface CallCenterTicket {
  code: string;
  subject: string;
  queue: string;
  assignee: string;
  priority: string;
  status: string;
  slaDue: string;
}

export interface CallCenterCall {
  direction: string;
  queue: string;
  agent: string;
  number: string;
  duration: string;
  outcome: string;
  startedAt: string;
}

export interface ReportHighlight {
  label: string;
  value: string;
  hint: string;
}

export interface QueuePerformanceRow {
  queue: string;
  answered: string;
  resolution: string;
  backlog: number;
}

export const overviewMetrics: OverviewMetric[] = [
  { label: "Open Tickets", value: "0", hint: "No tickets created yet" },
  { label: "Agents Online", value: "0", hint: "No agents assigned yet" },
  { label: "Calls Today", value: "0", hint: "No call activity logged" },
  { label: "SLA Hit Rate", value: "0%", hint: "Available once activity starts" },
] as const;

export const queues: CallCenterQueue[] = [];

export const agents: CallCenterAgent[] = [];

export const tickets: CallCenterTicket[] = [];

export const calls: CallCenterCall[] = [];

export const reportHighlights: ReportHighlight[] = [
  { label: "First Response", value: "0m", hint: "Starts tracking after first ticket" },
  { label: "Resolution Time", value: "0m", hint: "Available once tickets are resolved" },
  { label: "Abandon Rate", value: "0%", hint: "Available once calls are logged" },
  { label: "CSAT", value: "0 / 5", hint: "Available once surveys are collected" },
] as const;

export const queuePerformance: QueuePerformanceRow[] = [];