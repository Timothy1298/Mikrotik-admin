export function getRedirectTarget(state?: { from?: { pathname?: string } }) {
  return state?.from?.pathname ?? "/dashboard";
}
