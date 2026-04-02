import { useEffect, useRef, useState } from "react";
import { AlertTriangle, PlugZap } from "lucide-react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import "@xterm/xterm/css/xterm.css";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { env } from "@/config/env";
import { can } from "@/lib/permissions/can";
import { permissions } from "@/lib/permissions/permissions";
import { storageKeys } from "@/lib/utils/storage";

export function RouterTerminalPanel({ routerId, anchorId }: { routerId: string; anchorId?: string }) {
  const autoReconnectAttemptsRef = useRef(0);
  const autoReconnectTimerRef = useRef<number | null>(null);
  const reconnectVersionRef = useRef(0);
  const { data: user } = useCurrentUser(true);
  const hasTerminalAccess = can(user, permissions.routersRunCommand);
  const terminalHostRef = useRef<HTMLDivElement | null>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const dataListenerRef = useRef<{ dispose: () => void } | null>(null);
  const resizeListenerRef = useRef<{ dispose: () => void } | null>(null);
  const [connectionState, setConnectionState] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [lastError, setLastError] = useState<string | null>(null);
  const [terminalMode, setTerminalMode] = useState<string | null>(null);
  const [terminalEndpoint, setTerminalEndpoint] = useState<{ host?: string | null; port?: number | null; transport?: string | null; pathType?: string | null } | null>(null);
  const [reconnectVersion, setReconnectVersion] = useState(0);

  useEffect(() => {
    reconnectVersionRef.current = reconnectVersion;
  }, [reconnectVersion]);

  const triggerReconnect = () => {
    setReconnectVersion((value) => value + 1);
  };

  useEffect(() => {
    if (!hasTerminalAccess || !terminalHostRef.current) return;

    const terminal = new Terminal({
      cursorBlink: true,
      convertEol: true,
      fontSize: 13,
      theme: { background: "#111827" },
    });
    const fitAddon = new FitAddon();

    terminal.loadAddon(fitAddon);
    terminal.loadAddon(new WebLinksAddon());
    terminal.open(terminalHostRef.current);
    fitAddon.fit();

    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;

    const handleResize = () => fitAddon.fit();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (autoReconnectTimerRef.current !== null) {
        window.clearTimeout(autoReconnectTimerRef.current);
        autoReconnectTimerRef.current = null;
      }
      dataListenerRef.current?.dispose();
      resizeListenerRef.current?.dispose();
      socketRef.current?.close();
      terminal.dispose();
      terminalRef.current = null;
      fitAddonRef.current = null;
    };
  }, [hasTerminalAccess]);

  useEffect(() => {
    const terminal = terminalRef.current;
    const fitAddon = fitAddonRef.current;
    if (!hasTerminalAccess || !terminal || !fitAddon) return;

    dataListenerRef.current?.dispose();
    resizeListenerRef.current?.dispose();
    const previousSocket = socketRef.current;
    socketRef.current = null;
    previousSocket?.close();

    setConnectionState("connecting");
    setLastError(null);
    setTerminalMode(null);
    setTerminalEndpoint(null);
    terminal.clear();
    terminal.writeln("Connecting to router terminal...");

    const token = localStorage.getItem(storageKeys.accessToken) || "";
    const wsUrl = `${env.wsBaseUrl}/ws/terminal/${routerId}?token=${encodeURIComponent(token)}`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;
    let disposed = false;
    let terminalReady = false;
    let sessionErrored = false;
    let shouldAutoReconnect = false;

    socket.onopen = () => {
      if (disposed || socketRef.current !== socket) return;
      setConnectionState("connected");
      fitAddon.fit();
      socket.send(JSON.stringify({ type: "resize", rows: terminal.rows, cols: terminal.cols }));
      dataListenerRef.current = terminal.onData((data) => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: "input", data }));
        }
      });
      resizeListenerRef.current = terminal.onResize(({ rows, cols }) => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: "resize", rows, cols }));
        }
      });
      terminal.focus();
    };

    socket.onmessage = (event) => {
      if (disposed || socketRef.current !== socket) return;
      try {
        const payload = JSON.parse(String(event.data || "{}"));
        if (payload.type === "output" && typeof payload.data === "string") {
          terminalReady = true;
          autoReconnectAttemptsRef.current = 0;
          terminal.write(payload.data);
          return;
        }
        if (payload.type === "status" && payload.state === "connected") {
          terminalReady = true;
          autoReconnectAttemptsRef.current = 0;
          setTerminalMode(typeof payload.mode === "string" ? payload.mode : null);
          setTerminalEndpoint(payload.endpoint || null);
          return;
        }
        if (payload.type === "error") {
          sessionErrored = true;
          const message = payload.message || "Terminal session failed";
          const isKeepaliveTimeout = /keepalive timeout/i.test(message);
          shouldAutoReconnect = terminalReady && isKeepaliveTimeout;
          setLastError(isKeepaliveTimeout ? "Terminal connection timed out. Reconnecting..." : message);
          terminal.writeln(`\r\n[error] ${message}\r\n`);
          if (isKeepaliveTimeout) {
            terminal.writeln("\r\n[reconnecting]\r\n");
          }
          return;
        }
        if (payload.type === "closed") {
          setConnectionState("disconnected");
          terminal.writeln("\r\n[session closed]\r\n");
        }
      } catch {
        terminal.writeln("\r\n[invalid terminal payload]\r\n");
      }
    };

    socket.onerror = () => {
      if (disposed || socketRef.current !== socket) return;
      sessionErrored = true;
      setLastError("Web terminal connection failed");
    };

    socket.onclose = () => {
      if (disposed || socketRef.current !== socket) return;
      setConnectionState("disconnected");
      dataListenerRef.current?.dispose();
      resizeListenerRef.current?.dispose();
      dataListenerRef.current = null;
      resizeListenerRef.current = null;
      socketRef.current = null;
      if (shouldAutoReconnect && autoReconnectAttemptsRef.current < 3) {
        const nextAttempt = autoReconnectAttemptsRef.current + 1;
        autoReconnectAttemptsRef.current = nextAttempt;
        const reconnectDelayMs = nextAttempt * 1500;
        autoReconnectTimerRef.current = window.setTimeout(() => {
          autoReconnectTimerRef.current = null;
          if (reconnectVersionRef.current === reconnectVersion) {
            triggerReconnect();
          }
        }, reconnectDelayMs);
        return;
      }
      if (!terminalReady && !sessionErrored) {
        setLastError("Web terminal connection failed");
      }
    };

    return () => {
      disposed = true;
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
      if (autoReconnectTimerRef.current !== null) {
        window.clearTimeout(autoReconnectTimerRef.current);
        autoReconnectTimerRef.current = null;
      }
      socket.close();
      dataListenerRef.current?.dispose();
      resizeListenerRef.current?.dispose();
      dataListenerRef.current = null;
      resizeListenerRef.current = null;
    };
  }, [hasTerminalAccess, routerId, reconnectVersion]);

  if (!hasTerminalAccess) {
    return null;
  }

  const tone = connectionState === "connected" ? "success" : connectionState === "connecting" ? "warning" : "danger";

  return (
    <div id={anchorId}>
    <Card className="space-y-5">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Live terminal</CardTitle>
            <CardDescription>Interactive RouterOS console using the best available remote path, with API console fallback when SSH is unreachable.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={tone}>{connectionState}</Badge>
            {connectionState === "disconnected" ? (
              <Button variant="outline" leftIcon={<PlugZap className="h-4 w-4" />} onClick={triggerReconnect}>
                Reconnect
              </Button>
            ) : null}
          </div>
        </div>
      </CardHeader>

      <div className="rounded-2xl border border-warning/20 bg-warning/10 px-4 py-3 text-sm text-primary">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>This is a live shell on the router. Commands execute immediately.</span>
        </div>
      </div>

      {lastError ? <div className="rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">{lastError}</div> : null}

      {terminalMode || terminalEndpoint ? (
        <div className="rounded-2xl border border-background-border bg-background-panel px-4 py-3 text-sm text-text-secondary">
          <p>Mode: <span className="text-text-primary">{terminalMode || "unknown"}</span></p>
          <p className="mt-1">Path: <span className="text-text-primary">{terminalEndpoint?.pathType || "unknown"}</span></p>
          <p className="mt-1">Endpoint: <span className="font-mono text-text-primary">{terminalEndpoint?.host || "unknown"}{terminalEndpoint?.port ? `:${terminalEndpoint.port}` : ""} {terminalEndpoint?.transport ? `• ${terminalEndpoint.transport}` : ""}</span></p>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-background-border bg-[#111827] p-2">
        <div ref={terminalHostRef} className="min-h-[28rem] w-full" />
      </div>
    </Card>
    </div>
  );
}
