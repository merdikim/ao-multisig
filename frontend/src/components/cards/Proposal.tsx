import { useWallet } from "@/context/useWallet";
import { useVoteProposal } from "@/hooks/useMultisig";
import { MultisigData, Proposal, Vote } from "@/types";
import { formatDate, getProposalStatus, getVoteCounts, statusTone } from "@/utils";
import { Check, Loader2, X } from "lucide-react";

function ProposalCard({
  multisigData,
  proposal,
}: {
  multisigData: MultisigData;
  proposal: Proposal;
}) {
  const { address, isConnected } = useWallet();
  const voteProposal = useVoteProposal();
  const counts = getVoteCounts(proposal);
  const status = getProposalStatus(proposal, multisigData.signers.length);
  const approvalProgress = Math.min(100, (counts.yes / proposal.threshold) * 100);
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
      </div>
      <p className="text-base font-semibold leading-6 text-slate-950">
        {proposal.description}
      </p>
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between gap-3 text-sm text-slate-500">
          <span>
            {counts.yes} yes, {counts.no} no
          </span>
          <span>
            {proposal.threshold} votes required by {formatDate(proposal.endTime)}
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
