import Link from "next/link";
import { History, LayoutDashboard, Rocket, UserRound, Users } from "lucide-react";
import { UserMenu } from "@/components/user-menu";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const navItems = [
  { key: "deploy-log", label: "Deploy Log", href: "/deploy-log", icon: Rocket },
  { key: "revision-history", label: "Revision History", href: "/revision-history", icon: History },
  { key: "overview", label: "Overview", href: "/overview", icon: LayoutDashboard },
  { key: "team", label: "Team", href: "/team", icon: Users },
  { key: "profile", label: "Profile", href: "/profile", icon: UserRound },
] as const;

export function AppSidebar({
  current,
  user,
}: {
  current: (typeof navItems)[number]["key"];
  user: { name?: string | null; email?: string | null };
}) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border/60 bg-muted/20 p-4 md:flex">
      <div className="flex items-center gap-2 px-2 py-2">
        <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Rocket className="size-4" />
        </span>
        <span className="font-heading text-sm font-semibold">
          {APP_NAME}
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

      <div className="mt-auto border-t border-border/60 pt-2">
        <UserMenu user={user} />
      </div>
    </aside>
  );
}
