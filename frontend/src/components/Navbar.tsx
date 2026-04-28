import { useWallet } from "@/context/useWallet";
import { shortenAddress } from "@/utils";
import { Loader2, Wallet } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  return (
     <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
         
            <h1 className="text-sm font-semibold uppercase tracking-wide text-teal-700">
              AO multisig
            </h1>
          
          <WalletConnection />
        </div>
      </header>
  )
}

function WalletConnection() {

  const {
    address,
    connectWallet,
    disconnectWallet,
    isConnected,
    status,
  } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConnect() {
    setIsLoading(true);
    setError(null);

    try {
      await connectWallet();
    } catch (connectError) {
      setError(
        connectError instanceof Error
          ? connectError.message
          : "Could not connect wallet."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDisconnect() {
    setIsLoading(true);
    setError(null);

    try {
      await disconnectWallet();
    } catch {
      setError("Could not disconnect wallet.");
    } finally {
      setIsLoading(false);
    }
  }
  

  if (isConnected && address) {
    return (
      <div className="flex flex-col items-start gap-2 sm:items-end">
        <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          <Wallet size={16} />
          <span>Connected</span>
          <span className="font-semibold text-slate-950">
            {shortenAddress(address)}
          </span>
          <button
            className="ml-1 rounded-md px-2 py-1 text-xs font-semibold text-slate-500 transition hover:bg-white hover:text-slate-900"
            disabled={isLoading}
            onClick={handleDisconnect}
            type="button"
          >
            Disconnect
          </button>
        </div>
        {error ? <p className="text-xs text-rose-600">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <button
        className="button-primary"
        disabled={isLoading || status === "checking"}
        onClick={handleConnect}
        type="button"
      >
        {isLoading || status === "checking" ? (
          <Loader2 className="animate-spin" size={17} />
        ) : (
          <Wallet size={17} />
        )}
        Connect ArConnect
      </button>
      {status === "missing" ? (
        <p className="text-xs text-rose-600">ArConnect is not installed.</p>
      ) : null}
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}

export default Navbar
