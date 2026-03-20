/**
 * AppLayout — Root application shell.
 *
 * Renders SidebarNavigation + TopHeader + main content <Outlet>.
 * This is the single canonical layout; MainLayout is an alias kept
 * for backwards compatibility.
 *
 * Component hierarchy:
 *   AppLayout
 *     ├── SidebarNavigation   (collapsible dark sidebar)
 *     └── div.content-area
 *           ├── TopHeader     (global search, bank selector, notifications, user)
 *           └── <main>        (routed page content via <Outlet>)
 */

import { useState } from "react";
import { Outlet } from "react-router";
import { SidebarNavigation } from "./SidebarNavigation";
import { TopHeader } from "./TopHeader";

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f0f4f8]">
      {/* ── Left sidebar ── */}
      <SidebarNavigation
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
      />

      {/* ── Right: header + page content ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {/*
           * <Outlet /> renders the active child route:
           *   /             → ReconciliationDashboard  (DashboardPage)
           *   /matching     → TransactionMatching      (MatchingEnginePage)
           *   /exceptions   → ExceptionManagement      (ExceptionManagementPage)
           *   /reports      → ReportsAnalytics          (ReportsPage)
           *   /period-end   → PeriodEndClose            (PeriodClosePage)
           */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
