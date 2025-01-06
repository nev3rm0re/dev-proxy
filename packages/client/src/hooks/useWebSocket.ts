import { useEffect, useRef } from "react";
import { useProxyStore } from "../store/proxyStore";
import { ProxyEvent } from "../types/proxy";

export const useWebSocket = (url: string) => {
    const wsRef = useRef<WebSocket | null>(null);
    const mountedRef = useRef<boolean>(true);
    const { addEvent, setConnected, isConnected } = useProxyStore();

    useEffect(() => {
        mountedRef.current = true;

        const connect = () => {
            if (!mountedRef.current || wsRef.current?.readyState === WebSocket.CONNECTING) return;

            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }

            console.log("Connecting to WebSocket...");
            const ws = new WebSocket(url);

            ws.onopen = () => {
                console.log("WebSocket connected to proxy server");
                setConnected(true);
            };

            ws.onmessage = (event) => {
                try {
                    const proxyEvent: ProxyEvent = JSON.parse(event.data);
                    addEvent(proxyEvent);
                } catch (error) {
                    console.error("Error parsing WebSocket message:", error);
                }
            };

            ws.onclose = () => {
                if (isConnected) {
                    console.log("WebSocket disconnected from proxy server, reconnecting...");
                    setConnected(false);
                }
                if (mountedRef.current) {
                    //   setTimeout(connect, 2000);
                }
            };

            ws.onerror = (error) => {
                console.error("WebSocket error:", error);
                if (ws.readyState === WebSocket.OPEN) {
                    console.log("Closing open WebSocket on error")
                    ws.close();
                }
            };

            wsRef.current = ws;
        };

        connect();

        return () => {
            mountedRef.current = false;
            // Close socket only if it's open
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current?.close();
            }
        };
    }, [url]);

    return {
        ws: wsRef.current,
        isConnected
    };
};