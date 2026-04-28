import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { Multisig } from "@/types";
import MultisigDashboard from "@/components/multisig/Dashboard";
import Navbar from "@/components/Navbar";
import CreateMultisig from "@/components/forms/CreateMultisig";
import { useMultisigs } from "@/hooks/useMultisigs";
import Multisigs from "@/components/Multisigs";

// function SignerList({
//   multisigId,
//   signers,
// }: {
//   multisigId: string;
//   signers: Signer[];
// }) {
//   const addSigner = useAddSigner();
//   const removeSigner = useRemoveSigner();
//   const { isConnected } = useWallet();
//   const [address, setAddress] = useState("");

//   function onSubmit(event: FormEvent) {
//     event.preventDefault();
//     addSigner.mutate(
//       { multisigId, address },
//       { onSuccess: () => setAddress("") }
//     );
//   }

//   return (
//     <section className="panel p-4">
//       <div className="mb-4 flex items-center justify-between gap-3">
//         <div className="flex items-center gap-3">
//           <div className="flex h-9 w-9 items-center justify-center rounded-md bg-indigo-50 text-indigo-700">
//             <Users size={18} />
//           </div>
//           <h2 className="font-semibold text-slate-950">Signers</h2>
//         </div>
//         <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
//           {signers.length}
//         </span>
//       </div>
//       <div className="space-y-2">
//         {signers.map((signer) => (
//           <div
//             className="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2"
//             key={signer.address}
//           >
//             <div className="min-w-0">
//               <p className="text-sm font-semibold text-slate-900">
//                 {signer.label}
//               </p>
//               <p className="break-all text-xs text-slate-500">
//                 {shortenAddress(signer.address)}
//               </p>
//             </div>
//             <button
//               aria-label={`Remove ${signer.label}`}
//               className="icon-button shrink-0"
//               disabled={
//                 removeSigner.isPending || signers.length <= 1 || !isConnected
//               }
//               onClick={() =>
//                 removeSigner.mutate({ multisigId, address: signer.address })
//               }
//               title="Remove signer"
//               type="button"
//             >
//               <Trash2 size={16} />
//             </button>
//           </div>
//         ))}
//       </div>
//       <form className="mt-4 flex gap-2" onSubmit={onSubmit}>
//         <input
//           className="input"
//           placeholder="New signer address"
//           value={address}
//           onChange={(event) => setAddress(event.target.value)}
//           required
//         />
//         <button
//           aria-label="Add signer"
//           className="icon-button shrink-0"
//           disabled={addSigner.isPending || !isConnected}
//           title="Add signer"
//           type="submit"
//         >
//           {addSigner.isPending ? (
//             <Loader2 className="animate-spin" size={16} />
//           ) : (
//             <UserPlus size={16} />
//           )}
//         </button>
//       </form>
//       {addSigner.error ? (
//         <p className="mt-2 text-sm text-rose-600">{addSigner.error.message}</p>
//       ) : null}
//       {removeSigner.error ? (
//         <p className="mt-2 text-sm text-rose-600">
//           {removeSigner.error.message}
//         </p>
//       ) : null}
//     </section>
//   );
// }

// function ProposalCard({
//   multisig,
//   proposal,
// }: {
//   multisig: Multisig;
//   proposal: Proposal;
// }) {
//   const voteProposal = useVoteProposal();
//   const { isConnected } = useWallet();
//   const counts = getVoteCounts(proposal);
//   const status = getProposalStatus(proposal, multisig.signers.length);
//   const approvalProgress = Math.min(100, (counts.yes / proposal.threshold) * 100);

//   return (
//     <article className="rounded-md border border-slate-200 bg-white p-4">
//       <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
//         <div>
//           <div className="mb-2 flex flex-wrap items-center gap-2">
//             <span className="text-sm font-semibold text-slate-500">
//               Proposal #{proposal.id}
//             </span>
//             <span
//               className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${statusTone(
//                 status
//               )}`}
//             >
//               {status}
//             </span>
//           </div>
//           <p className="text-base font-semibold leading-6 text-slate-950">
//             {proposal.description}
//           </p>
//         </div>
//         <div className="flex shrink-0 gap-2">
//           <button
//             className="button-secondary"
//             disabled={
//               voteProposal.isPending || status !== "active" || !isConnected
//             }
//             onClick={() =>
//               voteProposal.mutate({
//                 multisigId: multisig.processId,
//                 proposalId: proposal.id,
//                 vote: "yes",
//               })
//             }
//             type="button"
//           >
//             <Check size={16} />
//             Yes
//           </button>
//           <button
//             className="button-secondary"
//             disabled={
//               voteProposal.isPending || status !== "active" || !isConnected
//             }
//             onClick={() =>
//               voteProposal.mutate({
//                 multisigId: multisig.processId,
//                 proposalId: proposal.id,
//                 vote: "no",
//               })
//             }
//             type="button"
//           >
//             <X size={16} />
//             No
//           </button>
//         </div>
//       </div>
//       <div className="mt-4">
//         <div className="mb-2 flex items-center justify-between text-sm text-slate-500">
//           <span>
//             {counts.yes} yes, {counts.no} no
//           </span>
//           <span>
//             {proposal.threshold} required by {formatDate(proposal.endTime)}
//           </span>
//         </div>
//         <div className="h-2 overflow-hidden rounded-full bg-slate-100">
//           <div
//             className="h-full rounded-full bg-teal-600"
//             style={{ width: `${approvalProgress}%` }}
//           />
//         </div>
//       </div>
//       {voteProposal.error ? (
//         <p className="mt-3 text-sm text-rose-600">{voteProposal.error.message}</p>
//       ) : null}
//     </article>
//   );
// }

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
