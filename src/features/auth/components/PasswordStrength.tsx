import { Progress } from "@/components/ui/Progress";

export function PasswordStrength({ password }: { password: string }) {
  const score = Math.min(100, password.length * 12 + (/[A-Z]/.test(password) ? 15 : 0) + (/\d/.test(password) ? 15 : 0) + (/[^A-Za-z0-9]/.test(password) ? 20 : 0));
  const label = score > 75 ? "Strong" : score > 45 ? "Moderate" : "Weak";
  return <div className="space-y-2"><div className="flex items-center justify-between text-xs text-slate-400"><span>Password strength</span><span>{label}</span></div><Progress value={score} /></div>;
}
