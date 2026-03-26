import { useEffect, useMemo, useRef, useState } from "react";
import { useAuthStore } from "@/app/store/auth.store";
import { env } from "@/config/env";

type WebSocketMessage = Record<string, unknown> | null;

function getWebSocketUrl() {
  const base = new URL(env.apiBaseUrl);
  base.protocol = base.protocol === "https:" ? "wss:" : "ws:";
  base.pathname = "/ws";
  return base.toString();
}

export function useWebSocket(rooms: string[]) {
  const user = useAuthStore((state) => state.user);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttemptsRef = useRef(0);
  const socketRef = useRef<WebSocket | null>(null);
  const retryTimeoutRef = useRef<number | null>(null);
  const roomsKey = useMemo(() => [...new Set(rooms)].sort().join("|"), [rooms]);
  const stableRooms = useMemo(() => (roomsKey ? roomsKey.split("|") : []), [roomsKey]);

  useEffect(() => {
    if (!user) return undefined;

    let cancelled = false;

    const connect = () => {
      if (cancelled || socketRef.current?.readyState === WebSocket.OPEN || socketRef.current?.readyState === WebSocket.CONNECTING) return;
      const socket = new WebSocket(getWebSocketUrl());
      socketRef.current = socket;

      socket.onopen = () => {
        if (cancelled) return;
        reconnectAttemptsRef.current = 0;
        setIsConnected(true);
        stableRooms.forEach((room) => {
          socket.send(JSON.stringify({ type: "subscribe", room }));
        });
      };

      socket.onmessage = (event) => {
        try {
          setLastMessage(JSON.parse(String(event.data || "{}")));
        } catch {
          setLastMessage(null);
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
        if (socketRef.current === socket) {
          socketRef.current = null;
        }
        if (cancelled) return;
        if (reconnectAttemptsRef.current >= 3) return;
        const delay = Math.min(30000, 1000 * (2 ** reconnectAttemptsRef.current));
        reconnectAttemptsRef.current += 1;
        retryTimeoutRef.current = window.setTimeout(connect, delay);
      };

      socket.onerror = () => {
        socket.close();
      };
    };

    const handleReconnectOpportunity = () => {
      if (cancelled || socketRef.current?.readyState === WebSocket.OPEN || socketRef.current?.readyState === WebSocket.CONNECTING) return;
      if (retryTimeoutRef.current != null) {
        window.clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      reconnectAttemptsRef.current = 0;
      connect();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        handleReconnectOpportunity();
      }
    };

    connect();
    window.addEventListener("online", handleReconnectOpportunity);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      setIsConnected(false);
      window.removeEventListener("online", handleReconnectOpportunity);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (retryTimeoutRef.current != null) {
        window.clearTimeout(retryTimeoutRef.current);
      }
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        stableRooms.forEach((room) => {
          socketRef.current?.send(JSON.stringify({ type: "unsubscribe", room }));
        });
      }
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [roomsKey, stableRooms, user]);

  return { lastMessage, isConnected };
}
