import { Activity, Router, ShieldCheck } from "lucide-react";

const featureCards = [
  { icon: ShieldCheck, title: "Secure auth-first foundation", description: "Role-aware access and cleaner operator flows from the first release." },
  { icon: Router, title: "Router and tunnel operations", description: "Provisioning, remote access, and infrastructure visibility in one workspace." },
  { icon: Activity, title: "Telemetry-ready monitoring shell", description: "Prepared for health metrics, proxy views, and WireGuard status insights." },
];

export function AuthHero() {
  return (
    <aside className="hidden min-h-[760px] rounded-[2rem] border border-background-border bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.16)_0%,transparent_42%),linear-gradient(90deg,#080e1f_0%,#0a1220_60%,#080e1f_100%)] p-8 lg:flex lg:flex-col lg:justify-between lg:p-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Network operations suite</p>
        <h2 className="mt-5 max-w-lg text-4xl font-semibold leading-tight text-text-primary xl:text-5xl">
          Operate routers and WireGuard infrastructure with confidence.
        </h2>
        <p className="mt-5 max-w-xl text-base leading-7 text-text-secondary">
          Built for provisioning, monitoring, billing oversight, and support workflows in one secure admin console.
        </p>
      </div>

      <div className="grid gap-4">
        {featureCards.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="rounded-3xl border border-background-border bg-background-elevated p-5 text-text-primary">
              <div className="flex items-start gap-4">
                <div className="icon-block-primary rounded-2xl p-3 text-text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-base font-medium text-text-primary">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">{item.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
