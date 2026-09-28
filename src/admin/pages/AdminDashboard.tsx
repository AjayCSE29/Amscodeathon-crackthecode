import { useCallback, useState } from "react";
import { Icon } from "../../components/ui/Icon";
import { LogoutIcon } from "../icons";
import { OverviewTab } from "../tabs/OverviewTab";
import { Round1Tab } from "../tabs/Round1Tab";
import { Round2Tab } from "../tabs/Round2Tab";
import { Round3Tab } from "../tabs/Round3Tab";
import { UsersTab } from "../tabs/UsersTab";
import { cn } from "../../lib/utils";

type TabId = "overview" | "users" | "round1" | "round2" | "round3";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "grid_view" },
  { id: "users", label: "User Management", icon: "person" },
  { id: "round1", label: "Round 1", icon: "check_circle" },
  { id: "round2", label: "Round 2", icon: "bug_report" },
  { id: "round3", label: "Round 3", icon: "memory" },
];

export function AdminDashboard({
  token,
  onLogout,
}: {
  token: string;
  onLogout: () => void;
}) {
  const [tab, setTab] = useState<TabId>("overview");
  const handleUnauthorized = useCallback(() => onLogout(), [onLogout]);

  return (
    <div className="min-h-screen bg-surface text-on-surface flex">
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-outline-variant/40 bg-surface-container-lowest">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-outline-variant/40">
          <Icon name="badge" className="text-primary text-xl" />
          <div>
            <p className="font-label-md text-label-md font-semibold text-on-surface tracking-wider">
              Codeathon
            </p>
            <p className="font-label-sm text-label-sm text-primary uppercase tracking-wider">
              Admin Console
            </p>
          </div>
        </div>
        <nav className="flex-1 py-3">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-5 py-2.5 text-left font-label-md text-label-md",
                tab === item.id
                  ? "bg-primary-fixed/40 text-on-surface font-semibold border-r-2 border-primary"
                  : "text-on-surface-variant hover:bg-surface-container-high",
              )}
            >
              <Icon name={item.icon} className="text-xl" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-outline-variant/40">
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high font-label-md text-label-md"
          >
            <LogoutIcon className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-outline-variant/40 bg-surface-container-lowest">
          <span className="font-label-md text-label-md font-semibold text-on-surface">
            Admin Console
          </span>
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-2 rounded-lg px-2 py-1 text-on-surface-variant font-label-md text-label-md"
            aria-label="Sign out"
          >
            Sign out
            <LogoutIcon className="h-4 w-4" />
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="md:hidden flex gap-2 flex-wrap pb-4">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 font-label-md text-label-md",
                  tab === item.id
                    ? "bg-primary text-on-primary font-semibold"
                    : "bg-surface-container-high text-on-surface-variant",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          {tab === "overview" ? (
            <OverviewTab token={token} onUnauthorized={handleUnauthorized} />
          ) : null}
          {tab === "users" ? <UsersTab token={token} onUnauthorized={handleUnauthorized} /> : null}
          {tab === "round1" ? <Round1Tab token={token} onUnauthorized={handleUnauthorized} /> : null}
          {tab === "round2" ? <Round2Tab token={token} onUnauthorized={handleUnauthorized} /> : null}
          {tab === "round3" ? <Round3Tab token={token} onUnauthorized={handleUnauthorized} /> : null}
        </main>
      </div>
    </div>
  );
}