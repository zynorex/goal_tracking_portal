"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Target, Users, Settings, LogOut, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === "loading") {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-[#2E86AB]" /></div>;
  }

  if (status === "unauthenticated") {
    // This will be handled by middleware, but fallback here just in case
    return null;
  }

  const role = session?.user?.role || "EMPLOYEE";

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "MANAGER", "EMPLOYEE"] },
    { name: "My Goals", href: "/goals", icon: Target, roles: ["EMPLOYEE", "MANAGER", "ADMIN"] },
    { name: "Team Goals", href: "/team", icon: Users, roles: ["MANAGER", "ADMIN"] },
    { name: "Admin Settings", href: "/admin", icon: Settings, roles: ["ADMIN"] },
  ];

  const allowedNavItems = navItems.filter(item => item.roles.includes(role));

  return (
    <div className="flex h-screen bg-[#F4F6F9] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#DDE3ED] flex flex-col shadow-sm z-10">
        <div className="p-6 border-b border-[#DDE3ED]">
          <h1 className="text-xl font-bold text-[#1E3A5F] tracking-tight">AtomQuest</h1>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-semibold">Goal Tracking</p>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <nav className="space-y-1">
            {allowedNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-[#2E86AB]/10 text-[#2E86AB]" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-[#2E86AB]" : "text-slate-400")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-[#DDE3ED]">
          <div className="flex items-center mb-4">
            <Avatar className="h-9 w-9 bg-[#1E3A5F] text-white mr-3">
              <AvatarFallback className="bg-[#1E3A5F] text-white">
                {session?.user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-900 truncate">{session?.user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{role}</p>
            </div>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center px-3 py-2 text-sm font-medium text-slate-600 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5 text-slate-400 group-hover:text-red-500" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-[#DDE3ED] flex items-center px-8 shrink-0">
          <h2 className="text-lg font-semibold text-slate-800">
            {allowedNavItems.find(i => pathname === i.href || pathname.startsWith(`${i.href}/`))?.name || "Portal"}
          </h2>
        </header>
        <div className="flex-1 overflow-auto p-8 relative">
          {children}
        </div>
      </main>
    </div>
  );
}
