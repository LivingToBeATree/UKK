import { useEffect, useRef, useState } from 'react';
import { getApiBaseUrl } from '@/services/api';

interface UseEventStreamOptions<T> {
    url: string | null;
    enabled?: boolean;
    eventNames?: string[];
    onMessage?: (data: T, eventName?: string) => void;
    onError?: (err: Event) => void;
}

export function useEventStream<T = unknown>({
    url,
    enabled = true,
    eventNames = ['message', 'notification'],
    onMessage,
    onError,
}: UseEventStreamOptions<T>) {
    const [connected, setConnected] = useState(false);
    const [lastData, setLastData] = useState<T | null>(null);
    const eventSourceRef = useRef<EventSource | null>(null);

    useEffect(() => {
        if (!url || !enabled || typeof window === 'undefined') {
            return;
        }

        let fullUrl: string;
        if (url.startsWith('http://') || url.startsWith('https://')) {
            fullUrl = url;
        } else {
            const apiBase = getApiBaseUrl().replace(/\/+$/, '');
            let cleanPath = url.startsWith('/') ? url : `/${url}`;
            if (apiBase.endsWith('/api') && cleanPath.startsWith('/api/')) {
                cleanPath = cleanPath.slice(4);
            }
            fullUrl = `${apiBase}${cleanPath}`;
        }

        // EventSource with credentials
        const es = new EventSource(fullUrl, { withCredentials: true });
        eventSourceRef.current = es;

        es.onopen = () => {
            setConnected(true);
        };

        const handleEvent = (event: MessageEvent, name?: string) => {
            try {
                const parsed = JSON.parse(event.data);
                setLastData(parsed);
                onMessage?.(parsed, name);
            } catch {
                // Ignore ping or non-JSON comments
            }
        };

        es.onmessage = (e) => handleEvent(e);

        eventNames.forEach((name) => {
            es.addEventListener(name, ((e: MessageEvent) => handleEvent(e, name)) as EventListener);
        });

        es.onerror = (err) => {
            setConnected(false);
            onError?.(err);
        };

        return () => {
            es.close();
            eventSourceRef.current = null;
            setConnected(false);
        };
    }, [url, enabled, eventNames, onMessage, onError]);

    return { connected, lastData, close: () => eventSourceRef.current?.close() };
}

