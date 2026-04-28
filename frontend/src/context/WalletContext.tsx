import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { WalletContext, type WalletStatus } from "@/context/walletState";

const permissions = [
  "ACCESS_ADDRESS",
  "SIGN_TRANSACTION",
  "DISPATCH",
  "SIGNATURE",
] as const;

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [status, setStatus] = useState<WalletStatus>("checking");

  const refreshAddress = useCallback(async () => {
    if (!window.arweaveWallet) {
      setStatus("missing");
      return;
    }

    try {
      const activeAddress = await window.arweaveWallet.getActiveAddress();
      setAddress(activeAddress);
      setStatus("connected");
    } catch {
      setAddress(null);
      setStatus("disconnected");
    }
  }, []);

  useEffect(() => {
    void refreshAddress();
  }, [refreshAddress]);

  const connectWallet = useCallback(async () => {
    if (!window.arweaveWallet) {
      setStatus("missing");
      throw new Error("Install ArConnect to connect a wallet.");
    }

    await window.arweaveWallet.connect([...permissions], {
      name: "AO Multisig",
    });
    await refreshAddress();
  }, [refreshAddress]);

  const disconnectWallet = useCallback(async () => {
    if (window.arweaveWallet) {
      await window.arweaveWallet.disconnect();
    }

    setAddress(null);
    setStatus(window.arweaveWallet ? "disconnected" : "missing");
  }, []);

  const value = useMemo(
    () => ({
      address,
      status,
      isConnected: status === "connected" && Boolean(address),
      connectWallet,
      disconnectWallet,
    }),
    [address, connectWallet, disconnectWallet, status]
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}
