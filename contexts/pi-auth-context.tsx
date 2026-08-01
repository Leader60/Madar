"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { PI_NETWORK_CONFIG } from "@/lib/system-config";
import { buildPiSdk, createSdk } from "@/lib/pi";
import type {
  Product,
  SDKLiteInstance,
  UserPurchaseBalance,
} from "@/lib/sdklite-types";

const COMMUNICATION_REQUEST_TYPE = '@pi:app:sdk:communication_information_request';

function isInIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch (error) {
    if (
      error instanceof DOMException &&
      (error.name === 'SecurityError' || error.code === DOMException.SECURITY_ERR || error.code === 18)
    ) {
      return true;
    }
    if (error instanceof Error && /Permission denied/i.test(error.message)) {
      return true;
    }
    return false;
  }
}

function parseJsonSafely(value: any): any {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (error) {
      return null;
    }
  }
  return typeof value === 'object' && value !== null ? value : null;
}

function requestParentCredentials(): Promise<{ accessToken: string; appId: string | null } | null> {
  if (!isInIframe()) {
    return Promise.resolve(null);
  }

  const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const timeoutMs = 1500;

  return new Promise((resolve) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const cleanup = (listener: (event: MessageEvent) => void) => {
      window.removeEventListener('message', listener);
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };

    const messageListener = (event: MessageEvent) => {
      if (event.source !== window.parent) {
        return;
      }

      const data = parseJsonSafely(event.data);
      if (!data || data.type !== COMMUNICATION_REQUEST_TYPE || data.id !== requestId) {
        return;
      }

      cleanup(messageListener);

      const payload = typeof data.payload === 'object' && data.payload !== null ? data.payload : {};
      const accessToken = typeof payload.accessToken === 'string' ? payload.accessToken : null;
      const appId = typeof payload.appId === 'string' ? payload.appId : null;

      resolve(accessToken ? { accessToken, appId } : null);
    };

    timeoutId = setTimeout(() => {
      cleanup(messageListener);
      resolve(null);
    }, timeoutMs);

    window.addEventListener('message', messageListener);

    window.parent.postMessage(
      JSON.stringify({
        type: COMMUNICATION_REQUEST_TYPE,
        id: requestId
      }),
      '*'
    );
  });
}

interface PiAuthContextType {
  isAuthenticated: boolean;
  authMessage: string;
  hasError: boolean;
  sdk: SDKLiteInstance | null;
  products: Product[] | null;
  restoredPurchases: UserPurchaseBalance[] | null;
  reinitialize: () => Promise<void>;
}

const PiAuthContext = createContext<PiAuthContextType | undefined>(undefined);

const DEFAULT_SDK_URL = "https://sdk.minepi.com/pi-sdk.js";
const DEFAULT_SDK_LITE_URL = "https://sdk.minepi.com/pi-sdk.js";

const loadScript = (src: string, globalKey: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && (window as any)[globalKey] !== undefined) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;

    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));

    document.head.appendChild(script);
  });
};

export function PiAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMessage, setAuthMessage] = useState("Initializing Pi Network...");
  const [hasError, setHasError] = useState(false);
  const [sdk, setSdk] = useState<SDKLiteInstance | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [restoredPurchases, setRestoredPurchases] = useState
    UserPurchaseBalance[] | null
  >(null);

  const fetchProducts = async (sdkInstance: SDKLiteInstance): Promise<void> => {
    try {
      const { products } = await sdkInstance.state.products();
      setProducts(products);
    } catch (e) {
      console.error("Failed to load products:", e);
      setProducts([]);
    }
  };

  const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number, fallbackValue: T): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((resolve) => setTimeout(() => resolve(fallbackValue), timeoutMs))
    ]);
  };

  const initialize = async () => {
    setHasError(false);
    setRestoredPurchases(null);
    try {
      const parentCredentials = await requestParentCredentials();
      if (parentCredentials) {
        setIsAuthenticated(true);
        return;
      }

      setAuthMessage("Loading Pi SDK...");
      const sdkUrl = PI_NETWORK_CONFIG?.SDK_URL || DEFAULT_SDK_URL;
      await loadScript(sdkUrl, "Pi");

      setAuthMessage("Initializing Pi Network...");
      if (typeof window !== "undefined" && (window as any).Pi) {
        await withTimeout(
          (window as any).Pi.init({
            version: "2.0",
            sandbox: PI_NETWORK_CONFIG?.SANDBOX ?? true,
          }),
          5000,
          null
        );
      }

      setAuthMessage("Loading SDKLite...");
      const sdkLiteUrl = PI_NETWORK_CONFIG?.SDK_LITE_URL || DEFAULT_SDK_LITE_URL;

      try {
        await loadScript(sdkLiteUrl, "SDKLite");
      } catch (e) {
        console.warn("SDKLite script optional load failed, continuing with Pi SDK");
      }

      setAuthMessage("Authenticating...");
      const pi = buildPiSdk();

      await withTimeout(pi.auth.login(), 5000, null);

      if (typeof (window as any).SDKLite !== "undefined") {
        const sdkLite = await (window as any).SDKLite.init();
        await withTimeout(sdkLite.login(), 5000, false);

        const sdkInstance = createSdk(sdkLite, pi);
        setSdk(sdkInstance);
        fetchProducts(sdkInstance).catch(console.error);

        try {
          const { purchases } = await sdkInstance.state.restore();
          setRestoredPurchases(purchases);
        } catch (e) {
          setRestoredPurchases([]);
        }
      }

      setIsAuthenticated(true);
    } catch (err) {
      console.error("SDK Initialization Error:", err);
      setHasError(true);
      setAuthMessage(
        err instanceof Error
          ? err.message
          : "Authentication error. Proceeding in preview mode."
      );
      setIsAuthenticated(true);
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  const value: PiAuthContextType = {
    isAuthenticated,
    authMessage,
    hasError,
    sdk,
    products,
    restoredPurchases,
    reinitialize: initialize,
  };

  return (
    <PiAuthContext.Provider value={value}>{children}</PiAuthContext.Provider>
  );
}

export function usePiAuth() {
  const context = useContext(PiAuthContext);
  if (context === undefined) {
    throw new Error("usePiAuth must be used within a PiAuthProvider");
  }
  return context;
}
