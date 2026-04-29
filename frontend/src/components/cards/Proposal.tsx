import { MultisigData, Proposal } from "@/types";
import { formatDate, getProposalStatus, getVoteCounts, statusTone } from "@/utils";

function ProposalCard({
  multisigData,
  proposal,
}: {
  multisigData: MultisigData;
  proposal: Proposal;
}) {
  const counts = getVoteCounts(proposal);
  const status = getProposalStatus(proposal, multisigData.signers.length);
  const approvalProgress = Math.min(100, (counts.yes / proposal.threshold) * 100);

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
            {proposal.threshold} required by {formatDate(proposal.endTime)}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-teal-600"
            style={{ width: `${approvalProgress}%` }}
          />
        </div>
      </div>
    </article>
  );
}

export default ProposalCard