import { Clock3, Copy, Loader2, Trash2, Users } from "lucide-react";
import { useMultisig, useRemoveSigner } from "@/hooks/useMultisig";
import type { Multisig } from "@/types";
import { getProposalStatus, shortenAddress } from "@/utils";
import CreateTransferProposal from "@/components/forms/CreateTransferProposal";
import ProposalCard from "../cards/Proposal";
import AddSigner from "@/components/forms/AddSigner";
import { useWallet } from "@/context/useWallet";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Could not load multisig data.";
}

function MultisigDashboard({ multisig }: { multisig: Multisig | null }) {
  const {isLoading, isError, error, data:multisigData} = useMultisig(multisig?.processId || '')
  const removeSigner = useRemoveSigner();
  const { address, isConnected } = useWallet();

  if (!multisig) {
    return (
      <main className="panel flex min-h-72 items-center justify-center p-8 text-center text-sm text-slate-500">
        Select a multisig to view its process state.
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="panel flex min-h-72 items-center justify-center p-8 text-slate-600">
        <Loader2 className="mr-3 animate-spin" size={22} />
        Loading multisig data
      </main>
    );
  }

  if (isError) {
    return (
      <main className="panel flex min-h-72 items-center justify-center p-8 text-center">
        <div>
          <p className="font-semibold text-slate-950">Could not load multisig</p>
          <p className="mt-2 text-sm text-rose-600">{getErrorMessage(error)}</p>
        </div>
      </main>
    );
  }

  if (!multisigData) {
    return (
      <main className="panel flex min-h-72 items-center justify-center p-8 text-center text-sm text-slate-500">
        No multisig data found.
      </main>
    );
  }

  const activeCount = multisigData.proposals.filter(
    (proposal) =>
      getProposalStatus(
        proposal,
        // multisigData.signers.length,
        // multisigData.threshold
      ) === "active"
  ).length;

  return (
    <main className="space-y-5">
      <section className="panel p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">
              {multisigData.name}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="break-all">{multisigData.processId}</span>
              <button className="icon-button" title="Copy process id" type="button">
                <Copy size={12} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center sm:min-w-96">
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-2xl font-semibold text-slate-950">
                {multisigData.signers.length}
              </p>
              <p className="text-xs text-slate-500">Signers</p>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-2xl font-semibold text-slate-950">
                {multisigData.threshold}
              </p>
              <p className="text-xs text-slate-500">Quorum</p>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-2xl font-semibold text-slate-950">
                {activeCount}
              </p>
              <p className="text-xs text-slate-500">Active proposals</p>
            </div>
          </div>
        </div>
      </section>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="panel p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-teal-50 text-teal-700">
                <Clock3 size={18} />
              </div>
              <h2 className="font-semibold text-slate-950">Proposals</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {multisigData.proposals.length}
            </span>
          </div>
          <div className="space-y-3">
            {multisigData.proposals.length === 0 ? (
              <div className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                No proposals yet.
              </div>
            ) : (
              multisigData.proposals.map((proposal) => (
                <ProposalCard
                  key={proposal.id}
                  multisigData={multisigData}
                  proposal={proposal}
                />
              ))
            )}
          </div>
        </section>
        <div className="space-y-5">
          <section className="panel p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sky-50 text-sky-700">
                  <Users size={18} />
                </div>
                <h2 className="font-semibold text-slate-950">Signers</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {multisigData.signers.length}
              </span>
            </div>
            <div className="space-y-2">
              {multisigData.signers.map((signer) => {
                const isConnectedSigner = signer === address;

                return (
                  <div
                    className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                    key={signer}
                    title={signer}
                  >
                    <span>{shortenAddress(signer)}</span>
                    {!isConnectedSigner ? (
                      <button
                        aria-label={`Remove ${shortenAddress(signer)}`}
                        className="icon-button h-8 w-8 text-rose-600 hover:text-rose-700"
                        disabled={
                          removeSigner.isPending ||
                          !isConnected ||
                          multisigData.signers.length <= 1
                        }
                        onClick={() =>
                          removeSigner.mutate({
                            multisigId: multisigData.processId,
                            address: signer,
                          })
                        }
                        title="Remove signer"
                        type="button"
                      >
                        {removeSigner.isPending &&
                        removeSigner.variables?.address === signer ? (
                          <Loader2 className="animate-spin" size={15} />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
            {removeSigner.error ? (
              <p className="mt-3 text-sm text-rose-600">
                {removeSigner.error.message}
              </p>
            ) : null}
            {removeSigner.isSuccess ? (
              <p className="mt-3 text-sm text-emerald-700">Signer removed.</p>
            ) : null}
          </section>
          <AddSigner
            multisigId={multisigData.processId}
            signers={multisigData.signers}
          />
          <CreateTransferProposal multisigId={multisigData.processId} />
        </div>
      </div>
    </main>
  );
}

export default MultisigDashboard
