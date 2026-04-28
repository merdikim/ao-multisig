import { useWallet } from "@/context/useWallet";
import { useCreateProposal } from "@/hooks/useMultisig";
import { Loader2, Plus, Vote } from "lucide-react";
import { FormEvent, useState } from "react";

function ProposalForm({ multisigId }: { multisigId: string }) {
  const createProposal = useCreateProposal();
  const { isConnected } = useWallet();
  const [description, setDescription] = useState("");
  const [durationHours, setDurationHours] = useState(24);

  function onSubmit(event: FormEvent) {
    event.preventDefault();

    createProposal.mutate(
      { multisigId, description, durationHours },
      {
        onSuccess: () => {
          setDescription("");
          setDurationHours(24);
        },
      }
    );
  }

  return (
    <form className="panel p-4" onSubmit={onSubmit}>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-50 text-amber-700">
          <Vote size={18} />
        </div>
        <h2 className="font-semibold text-slate-950">New proposal</h2>
      </div>
      <div className="space-y-3">
        <textarea
          className="input min-h-28 resize-none"
          placeholder="Describe the action signers should approve"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
        />
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-600">
            Voting window
          </span>
          <select
            className="input"
            value={durationHours}
            onChange={(event) => setDurationHours(Number(event.target.value))}
          >
            <option value={6}>6 hours</option>
            <option value={24}>24 hours</option>
            <option value={72}>3 days</option>
            <option value={168}>7 days</option>
          </select>
        </label>
        <button
          className="button-primary w-full"
          disabled={createProposal.isPending || !isConnected}
          type="submit"
        >
          {createProposal.isPending ? (
            <Loader2 className="animate-spin" size={17} />
          ) : (
            <Plus size={17} />
          )}
          Submit proposal
        </button>
        {createProposal.error ? (
          <p className="text-sm text-rose-600">{createProposal.error.message}</p>
        ) : null}
      </div>
    </form>
  );
}

export default ProposalForm;
