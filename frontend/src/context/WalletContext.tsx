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

  useEffect(() => {
    const handleWalletChange = () => {
      void refreshAddress();
    };

    window.addEventListener("arweaveWalletLoaded", handleWalletChange);
    window.addEventListener("walletSwitch", handleWalletChange);
    window.addEventListener("walletDisconnect", handleWalletChange);
    window.addEventListener("focus", handleWalletChange);

    return () => {
      window.removeEventListener("arweaveWalletLoaded", handleWalletChange);
      window.removeEventListener("walletSwitch", handleWalletChange);
      window.removeEventListener("walletDisconnect", handleWalletChange);
      window.removeEventListener("focus", handleWalletChange);
    };
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
