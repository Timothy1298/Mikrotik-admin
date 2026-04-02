import { LoginForm } from "@/features/auth/components/LoginForm";

export function LoginPage() {
  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl items-center justify-center overflow-hidden py-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.04)_1px,transparent_1px)] bg-[length:48px_48px] animate-[pulseGrid_6s_ease-in-out_infinite]" />
        <div className="absolute -left-24 -top-24 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(0,212,255,0.1)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute -bottom-20 -right-16 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(0,100,200,0.12)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(0,0,0,0.05)_3px,rgba(0,0,0,0.05)_4px)]" />
      </div>

      <section className="relative z-10 grid w-full animate-fade-up gap-10 px-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(28rem,32rem)] lg:items-center lg:px-8">
        <div className="hidden lg:block">
          <div className="max-w-2xl">
            <div className="mb-8 flex items-center justify-between border-b border-[#163447] pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-[#466b80]">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-success shadow-[0_0_10px_rgba(34,197,94,0.75)]" />
                System online
              </span>
              <div className="flex items-center gap-4">
                <span>UTC+3</span>
                <span>TLS active</span>
              </div>
            </div>

            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[#7a9db5]">Secure network operations</p>
            <h1 className="mt-6 max-w-3xl text-5xl font-semibold uppercase tracking-[0.08em] text-text-primary xl:text-6xl">
              Manage MikroTik routers and WireGuard access from one secure console.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#88a7ba]">
              Provision routers, monitor tunnel health, review billing activity, and handle support workflows through the authenticated admin workspace.
            </p>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <div className="rounded-[4px] border border-[rgba(0,212,255,0.14)] bg-[rgba(15,26,46,0.8)] p-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#00d4ff]">Router control</p>
                <p className="mt-3 text-sm leading-6 text-[#88a7ba]">Provision endpoints, inspect connectivity, and track infrastructure state from one surface.</p>
              </div>
              <div className="rounded-[4px] border border-[rgba(0,212,255,0.14)] bg-[rgba(15,26,46,0.8)] p-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#00d4ff]">Protected access</p>
                <p className="mt-3 text-sm leading-6 text-[#88a7ba]">Role-aware sign-in, session handling, and two-factor verification stay fully intact.</p>
              </div>
              <div className="rounded-[4px] border border-[rgba(0,212,255,0.14)] bg-[rgba(15,26,46,0.8)] p-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#00d4ff]">Operations visibility</p>
                <p className="mt-3 text-sm leading-6 text-[#88a7ba]">Jump into telemetry, support actions, billing oversight, and device status without context switching.</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-5 font-mono text-[10px] uppercase tracking-[0.14em] text-[#4b6a7d]">
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                Link up
              </span>
              <span>Session encrypted</span>
              <span>Admin channel</span>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col items-center">
          <div className="mb-7 flex w-full items-center justify-between border-b border-[#163447] px-1 pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-[#466b80] lg:hidden">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-success shadow-[0_0_10px_rgba(34,197,94,0.75)]" />
              System online
            </span>
            <div className="flex items-center gap-4">
              <span>UTC+3</span>
              <span>TLS active</span>
            </div>
          </div>

          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(0,212,255,0.45)] text-[#00d4ff] shadow-[0_0_30px_rgba(0,212,255,0.12)] before:absolute before:-inset-2 before:rounded-full before:border before:border-[rgba(0,212,255,0.35)] before:content-[''] after:absolute after:-inset-4 after:rounded-full after:border after:border-dashed after:border-[rgba(0,212,255,0.15)] after:content-['']">
              <svg viewBox="0 0 64 64" className="h-9 w-9 fill-none stroke-current">
                <circle cx="32" cy="32" r="28" strokeWidth="1" stroke="rgba(0,212,255,0.25)" />
                <rect x="14" y="26" width="36" height="18" rx="3" strokeWidth="1.8" fill="rgba(0,212,255,0.06)" />
                <circle cx="22" cy="35" r="2.5" fill="currentColor" opacity="0.9" stroke="none" />
                <circle cx="32" cy="35" r="2.5" fill="currentColor" opacity="0.6" stroke="none" />
                <circle cx="42" cy="35" r="2.5" fill="currentColor" opacity="0.35" stroke="none" />
                <line x1="32" y1="26" x2="32" y2="18" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="26" y1="18" x2="38" y2="18" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="20" y1="44" x2="20" y2="50" strokeWidth="1.5" strokeLinecap="round" stroke="rgba(0,212,255,0.4)" />
                <line x1="32" y1="44" x2="32" y2="50" strokeWidth="1.5" strokeLinecap="round" stroke="rgba(0,212,255,0.4)" />
                <line x1="44" y1="44" x2="44" y2="50" strokeWidth="1.5" strokeLinecap="round" stroke="rgba(0,212,255,0.4)" />
              </svg>
            </div>
            <div className="text-[2rem] font-bold uppercase tracking-[0.18em] text-text-primary">
              Mikro<span className="text-[#00d4ff]">Tik</span>
            </div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#7a9db5]">Router Management System</p>
          </div>

          <div className="w-full max-w-[32rem]">
            <LoginForm />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-5 font-mono text-[10px] uppercase tracking-[0.14em] text-[#4b6a7d] lg:hidden">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
              Link up
            </span>
            <span>Session encrypted</span>
            <span>Admin channel</span>
          </div>
        </div>
      </section>
    </div>
  );
}
