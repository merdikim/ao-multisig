import { createContext } from "react";

export type WalletStatus = "checking" | "missing" | "disconnected" | "connected";

export type WalletContextValue = {
  address: string | null;
  status: WalletStatus;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
};

export const WalletContext = createContext<WalletContextValue | null>(null);
