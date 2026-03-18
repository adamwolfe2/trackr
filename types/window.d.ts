declare global {
    interface Window {
        __calTrackrInitialized?: boolean;
        Cal?: CalApi;
    }
}

interface CalApi {
    (...args: unknown[]): void;
    q?: unknown[];
    ns: Record<string, (...args: unknown[]) => void>;
    loaded?: boolean;
}

export {};
