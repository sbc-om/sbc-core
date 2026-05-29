import {
  CallCenterAgentsPage,
  CallCenterCallsPage,
  CallCenterOverviewPage,
  CallCenterQueuesPage,
  CallCenterReportsPage,
  CallCenterTicketsPage,
} from "./pages";

export const callCenterRoutes = [
  { path: "/call-center", page: CallCenterOverviewPage },
  { path: "/call-center/queues", page: CallCenterQueuesPage },
  { path: "/call-center/agents", page: CallCenterAgentsPage },
  { path: "/call-center/tickets", page: CallCenterTicketsPage },
  { path: "/call-center/calls", page: CallCenterCallsPage },
  { path: "/call-center/reports", page: CallCenterReportsPage },
] as const;
