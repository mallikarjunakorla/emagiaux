/**
 * routes.ts — Application router configuration.
 *
 * Uses React Router v7 Data-mode (createBrowserRouter).
 * All pages render inside AppLayout which provides the shell
 * (SidebarNavigation + TopHeader + <Outlet>).
 *
 * Page → Component mapping:
 *   /             DashboardPage          → ReconciliationDashboard
 *   /matching     MatchingEnginePage     → TransactionMatching
 *   /exceptions   ExceptionManagementPage→ ExceptionManagement
 *   /reports      ReportsPage            → ReportsAnalytics
 *   /period-end   PeriodClosePage        → PeriodEndClose
 */

import { createBrowserRouter } from "react-router";
import { AppLayout } from "./components/layout/AppLayout";
import { ReconciliationDashboard } from "./pages/ReconciliationDashboard";
// import { TransactionMatching } from "./pages/TransactionMatching";
import { ExceptionManagement } from "./pages/ExceptionManagement";
import { ReportsAnalytics } from "./pages/ReportsAnalytics";
import { PeriodEndClose } from "./pages/PeriodEndClose";
import { AdjustmentAttributes } from "./pages/AdjustmentAttributes";
import { ReconciliationSummary } from "./pages/ReconciliationSummary";
import { ReconciliationStatus } from "./pages/ReconciliationStatus";
import { TransactionV1 } from "./pages/TransactionV1";


export const router = createBrowserRouter([
  {
    path: "/",
    Component: AppLayout,
    children: [
      // DashboardPage
      { index: true, Component: ReconciliationDashboard },

      // AdjustmentAttributes
      { path: "adjustment", Component: AdjustmentAttributes },
      // ReconciliationSummary
      { path: "summary", Component: ReconciliationSummary },
      // ReconciliationStatus
      { path: "status", Component: ReconciliationStatus },

      // MatchingEnginePage
      // { path: "matching", Component: TransactionMatching },

      // TransactionV1
      { path: "transaction", Component: TransactionV1 },

      // ExceptionManagementPage
      { path: "exceptions", Component: ExceptionManagement },
      // ReportsPage
      { path: "reports", Component: ReportsAnalytics },
      // PeriodClosePage
      { path: "period-end", Component: PeriodEndClose },
    ],
  },
]);
