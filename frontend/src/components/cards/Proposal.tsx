import { useWallet } from "@/context/useWallet";
import { useVote } from "@/hooks/useMultisig";
import { MultisigData, Proposal, Vote } from "@/types";
import { formatDate, getProposalStatus, getVoteCounts, statusTone } from "@/utils";
import { Check, Loader2, X } from "lucide-react";

function proposalTypeLabel(proposal: Proposal) {
  switch (proposal.proposal_type) {
    case "add":
      return "Add signer";
    case "remove":
      return "Remove signer";
    default:
      return "Transfer";
  }
}

function proposalPayloadSummary(proposal: Proposal) {
  if (proposal.proposal_type === "add" || proposal.proposal_type === "remove") {
    return proposal.payload?.address;
  }

  if (proposal.proposal_type === "transfer") {
    return [proposal.payload?.amount, proposal.payload?.recipient]
      .filter(Boolean)
      .join(" to ");
  }

  return undefined;
}

function ProposalCard({
  multisigData,
  proposal,
}: {
  multisigData: MultisigData;
  proposal: Proposal;
}) {
  const { address, isConnected } = useWallet();
  const voteProposal = useVote();
  const counts = getVoteCounts(proposal);
  const threshold = multisigData.threshold
  // const threshold = Math.max(
  //   1,
  //   Math.min(multisigData.threshold || 1, multisigData.signers.length)
  // );
  const status = getProposalStatus(
    proposal,
    // multisigData.signers.length,
    // threshold
  );
  const approvalProgress = Math.min(100, (counts.yes / threshold) * 100);
  const isSigner = Boolean(address && multisigData.signers.includes(address));
  const currentVote = address ? proposal.votes[address] : undefined;
  const votingDisabled =
    status !== "active" ||
    !isConnected ||
    !isSigner ||
    Boolean(currentVote) ||
    voteProposal.isPending;

  function castVote(vote: Vote) {
    voteProposal.mutate({
      multisigId: multisigData.processId,
      proposalId: proposal.id,
      vote,
    });
  }

  return (
    <article className="rounded-md border border-slate-200 bg-white p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-slate-500">
          Proposal #{proposal.id}
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${statusTone(
            status
          )}`}
        >
          {status}
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
          {proposalTypeLabel(proposal)}
        </span>
      </div>
      <p className="text-base font-semibold leading-6 text-slate-950">
        {proposal.description}
      </p>
      {proposalPayloadSummary(proposal) ? (
        <p className="mt-2 break-all text-sm text-slate-500">
          {proposalPayloadSummary(proposal)}
        </p>
      ) : null}
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between gap-3 text-sm text-slate-500">
          <span>
            {counts.yes} yes, {counts.no} no
          </span>
          <span>
            {threshold} yes votes required by {formatDate(proposal.endTime)}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-teal-600"
            style={{ width: `${approvalProgress}%` }}
          />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            className="button-secondary h-9 px-3 text-emerald-700 disabled:text-slate-300"
            disabled={votingDisabled}
            onClick={() => castVote("yes")}
            type="button"
          >
            {voteProposal.isPending &&
            voteProposal.variables?.proposalId === proposal.id &&
            voteProposal.variables.vote === "yes" ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Check size={16} />
            )}
            Yes
          </button>
          <button
            className="button-secondary h-9 px-3 text-rose-700 disabled:text-slate-300"
            disabled={votingDisabled}
            onClick={() => castVote("no")}
            type="button"
          >
            {voteProposal.isPending &&
            voteProposal.variables?.proposalId === proposal.id &&
            voteProposal.variables.vote === "no" ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <X size={16} />
            )}
            No
          </button>
        </div>
        {currentVote ? (
          <span className="text-xs font-semibold capitalize text-slate-500">
            Your vote: {currentVote}
          </span>
        ) : null}
      </div>
      {!isConnected ? (
        <p className="mt-2 text-sm text-slate-500">Connect your wallet to vote.</p>
      ) : null}
      {isConnected && !isSigner ? (
        <p className="mt-2 text-sm text-slate-500">Only signers can vote.</p>
      ) : null}
      {voteProposal.error ? (
        <p className="mt-2 text-sm text-rose-600">
          {voteProposal.error.message}
        </p>
      ) : null}
    </article>
  );
}

export default ProposalCard
