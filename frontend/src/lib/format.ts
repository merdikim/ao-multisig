import type { Proposal, ProposalStatus } from "@/types";

export function shortenAddress(address: string) {
  if (address.length <= 16) {
    return address;
  }

  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

export function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export function getVoteCounts(proposal: Proposal) {
  return Object.values(proposal.votes).reduce(
    (counts, vote) => {
      if (vote === "yes") {
        counts.yes += 1;
      }

      if (vote === "no") {
        counts.no += 1;
      }

      return counts;
    },
    { yes: 0, no: 0 }
  );
}

export function getProposalStatus(
  proposal: Proposal,
  signerCount: number
): ProposalStatus {
  if (proposal.executed) {
    return "approved";
  }

  if (proposal.rejected) {
    return "rejected";
  }

  const { yes, no } = getVoteCounts(proposal);

  if (yes >= proposal.threshold) {
    return "approved";
  }

  if (no > signerCount - proposal.threshold) {
    return "rejected";
  }

  if (Date.now() > proposal.endTime) {
    return "expired";
  }

  return "active";
}

export function statusTone(status: ProposalStatus) {
  switch (status) {
    case "approved":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "rejected":
      return "bg-rose-50 text-rose-700 ring-rose-200";
    case "expired":
      return "bg-slate-100 text-slate-600 ring-slate-200";
    default:
      return "bg-amber-50 text-amber-700 ring-amber-200";
  }
}
