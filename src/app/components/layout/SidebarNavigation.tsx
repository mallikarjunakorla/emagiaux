import { useState } from "react";
import { NavLink, useLocation } from "react-router";
import {
  LayoutDashboard,
  GitMerge,
  AlertTriangle,
  BarChart3,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Building2,
  Settings,
  HelpCircle,
  Zap,
  Scale,
  SlidersHorizontal,
  Landmark,
} from "lucide-react";

const navItems = [
  {
    id: "dashboard",
    label: "Reconciliation Dashboard",
    icon: LayoutDashboard,
    path: "/",
    badge: null,
  },
  {
    id: "adjustment",
    label: "Adjustment Attributes",
    icon: SlidersHorizontal,
    path: "/adjustment",
    badge: null,
  },
  {
    id: "summary",
    label: "Reconciliation Summary",
    icon: Scale,
    path: "/summary",
    badge: null,
  },
  {
    id: "status",
    label: "Reconciliation Status",
    icon: Landmark,
    path: "/status",
    badge: null,
  },
  // {
  //   id: "matching",
  //   label: "Transaction Matching",
  //   icon: GitMerge,
  //   path: "/matching",
  //   badge: null,
  // },
  {
    id: "transaction",
    label: "Transaction Matching",
    icon: GitMerge,
    path: "/transaction",
    badge: null,
  },
  // {
  //   id: "exceptions",
  //   label: "Exception Management",
  //   icon: AlertTriangle,
  //   path: "/exceptions",
  //   badge: "14",
  // },
  // {
  //   id: "reports",
  //   label: "Reports & Analytics",
  //   icon: BarChart3,
  //   path: "/reports",
  //   badge: null,
  // },
  // {
  //   id: "period-end",
  //   label: "Period-End Close & Compliance",
  //   icon: CalendarCheck,
  //   path: "/period-end",
  //   badge: null,
  // },
];

const bottomItems = [
  { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
  { id: "help", label: "Help & Support", icon: HelpCircle, path: "/help" },
];

interface SidebarNavigationProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function SidebarNavigation({ collapsed, onToggle }: SidebarNavigationProps) {
  const location = useLocation();

  return (
    <aside
      className={`flex flex-col h-full bg-[#0b1426] border-r border-[#1e2d4a] transition-all duration-300 ease-in-out ${
        collapsed ? "w-[68px]" : "w-[240px]"
      }`}
    >
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-[#1e2d4a] min-h-[64px]">
        <div className="flex-shrink-0 w-8 h-8 bg-[#1a56db] rounded-lg flex items-center justify-center shadow-lg">
          <Zap size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="text-white text-sm font-semibold tracking-tight whitespace-nowrap">
              Emagia
            </div>
            <div className="text-[#4a6fa5] text-xs whitespace-nowrap">CMS Reconciliation</div>
          </div>
        )}
      </div>

      {/* Entity Selector */}
      {!collapsed && (
        <div className="mx-3 mt-3 mb-1 px-3 py-2 bg-[#111e35] rounded-lg border border-[#1e2d4a]">
          <div className="flex items-center gap-2">
            <Building2 size={14} className="text-[#4a6fa5] flex-shrink-0" />
            <div className="overflow-hidden">
              <div className="text-[#8ba3c7] text-xs">Legal Entity</div>
              <div className="text-white text-xs font-medium truncate">Apex Holdings Corp.</div>
            </div>
          </div>
        </div>
      )}

      {/* Nav Section Label */}
      {!collapsed && (
        <div className="px-4 pt-4 pb-1">
          <span className="text-[#3d5a80] text-xs font-semibold uppercase tracking-wider">
            Main Menu
          </span>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.id}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 relative ${
                isActive
                  ? "bg-[#1a56db] text-white shadow-md"
                  : "text-[#8ba3c7] hover:bg-[#111e35] hover:text-white"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#60a5fa] rounded-r-full" />
              )}
              <Icon size={18} className={`flex-shrink-0 ${isActive ? "text-white" : "text-[#4a6fa5] group-hover:text-[#8ba3c7]"}`} />
              {!collapsed && (
                <span className="text-sm whitespace-nowrap overflow-hidden flex-1">{item.label}</span>
              )}
              {!collapsed && item.badge && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${
                    item.badge === "Live"
                      ? "bg-[#065f46] text-[#34d399]"
                      : isActive
                      ? "bg-[#1d4ed8] text-[#93c5fd]"
                      : "bg-[#7c2d12] text-[#fca5a5]"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-3 border-t border-[#1e2d4a]" />

      {/* Bottom Nav */}
      <div className="px-2 py-2 space-y-0.5">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              title={collapsed ? item.label : undefined}
              className="w-full group flex items-center gap-3 px-3 py-2 rounded-lg text-[#4a6fa5] hover:bg-[#111e35] hover:text-[#8ba3c7] transition-all duration-150"
            >
              <Icon size={17} className="flex-shrink-0" />
              {!collapsed && <span className="text-sm whitespace-nowrap">{item.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Collapse Toggle */}
      <div className="px-2 pb-4 pt-1">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[#3d5a80] hover:bg-[#111e35] hover:text-[#8ba3c7] transition-all duration-150 border border-[#1e2d4a]"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : (
            <>
              <ChevronLeft size={16} />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
