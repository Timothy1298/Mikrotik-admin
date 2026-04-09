export function parseManagementHostInput(rawValue: string): { host: string; port: number | null } {
  const raw = String(rawValue || "").trim();
  if (!raw) {
    return { host: "", port: null };
  }

  const bracketedIpv6 = raw.match(/^\[([^\]]+)\](?::(\d{1,5}))?$/);
  if (bracketedIpv6) {
    return {
      host: bracketedIpv6[1].trim(),
      port: bracketedIpv6[2] ? Number(bracketedIpv6[2]) : null,
    };
  }

  const colonCount = (raw.match(/:/g) || []).length;
  if (colonCount === 1) {
    const separatorIndex = raw.lastIndexOf(":");
    const host = raw.slice(0, separatorIndex).trim();
    const port = Number(raw.slice(separatorIndex + 1));
    if (host && Number.isInteger(port) && port >= 1 && port <= 65535) {
      return { host, port };
    }
  }

  return { host: raw, port: null };
}
