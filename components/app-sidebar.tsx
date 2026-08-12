import Link from "next/link";
import { History, LayoutDashboard, Rocket, Users } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { cn } from "@/lib/utils";

const navItems = [
  { key: "deploy-log", label: "Deploy Log", href: "/deploy-log", icon: Rocket },
  { key: "revision-history", label: "Revision History", href: "/revision-history", icon: History },
  { key: "overview", label: "Overview", href: "/overview", icon: LayoutDashboard },
  { key: "team", label: "Team", href: "/team", icon: Users },
] as const;

export function AppSidebar({
  current,
  user,
}: {
  current: (typeof navItems)[number]["key"];
  user: { name?: string | null; email?: string | null };
}) {
  const displayName = user.name ?? user.email ?? "Signed in";
  const initial = (user.name ?? user.email ?? "?").trim().charAt(0).toUpperCase();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border/60 bg-muted/20 p-4 md:flex">
      <div className="flex items-center gap-2 px-2 py-2">
        <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Rocket className="size-4" />
        </span>
        <span className="font-heading text-sm font-semibold">
          Internal Portal
        </span>
      </div>

      <nav className="mt-6 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = item.key === current;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors",
                isActive
                  ? "bg-accent font-medium text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3 border-t border-border/60 pt-4">
        <div className="flex items-center gap-2 px-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
            {initial}
          </span>
          <span className="truncate text-sm text-muted-foreground">
            {displayName}
          </span>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}
