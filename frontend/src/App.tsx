import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { Multisig } from "@/types";
import MultisigDashboard from "@/components/multisig/Dashboard";
import Navbar from "@/components/Navbar";
import CreateMultisig from "@/components/forms/CreateMultisig";
import { useMultisigs } from "@/hooks/useMultisigs";
import Multisigs from "@/components/Multisigs";

export function App() {
  const [selectedMultisig, setSelectedMultisig] = useState<Multisig | null>(null);
  const {isLoading, isError, error, data:multisigs} = useMultisigs()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f7f4] text-slate-600">
        <Loader2 className="mr-3 animate-spin" size={22} />
        Loading multisigs
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f7f4] px-6 text-center text-slate-600">
        {error.message}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7f4]">
      <Navbar/>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-5">
            <Multisigs
              multisigs={multisigs}
              selected={selectedMultisig}
              onSelect={setSelectedMultisig}
            />
            <CreateMultisig/>
          </div>
          <MultisigDashboard multisig={selectedMultisig} />
        </div>
      </div>
    </div>
  );
}
