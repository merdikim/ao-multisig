import { useWallet } from "@/context/useWallet";
import { useSendTransferProposal } from "@/hooks/useMultisig";
import { isArweaveAddress } from "@/utils";
import { Loader2, Plus, Send } from "lucide-react";
import { FormEvent, useState } from "react";

type CreateTransferProposalProps = {
  multisigId: string;
};

function CreateTransferProposal({ multisigId }: CreateTransferProposalProps) {
  const createProposal = useSendTransferProposal();
  const { isConnected } = useWallet();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [durationHours, setDurationHours] = useState(24);

  const trimmedRecipient = recipient.trim();
  const trimmedAmount = amount.trim();
  const transferIsValid =
    isArweaveAddress(trimmedRecipient) && Number(trimmedAmount) > 0;

  function onSubmit(event: FormEvent) {
    event.preventDefault();

    createProposal.mutate(
      {
        multisigId,
        proposalType: "transfer",
        durationHours,
        recipient: trimmedRecipient,
        amount: trimmedAmount,
      },
      {
        onSuccess: () => {
          setRecipient("");
          setAmount("");
          setDurationHours(24);
        },
      }
    );
  }

  return (
    <form className="panel p-4" onSubmit={onSubmit}>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-50 text-amber-700">
          <Send size={18} />
        </div>
        <h2 className="font-semibold text-slate-950">Transfer</h2>
      </div>
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_120px]">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-600">
              Recipient
            </span>
            <input
              className="input"
              placeholder="Recipient wallet address"
              value={recipient}
              onChange={(event) => setRecipient(event.target.value)}
              maxLength={43}
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-600">
              Amount
            </span>
            <input
              className="input"
              min="0"
              placeholder="0"
              step="any"
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />
          </label>
        </div>
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
          disabled={
            createProposal.isPending ||
            !isConnected ||
            !transferIsValid
          }
          type="submit"
        >
          {createProposal.isPending ? (
            <Loader2 className="animate-spin" size={17} />
          ) : (
            <Plus size={17} />
          )}
          Submit proposal
        </button>
        {!isConnected ? (
          <p className="text-sm text-slate-500">
            Connect your wallet to submit a proposal.
          </p>
        ) : null}
        {createProposal.error ? (
          <p className="text-sm text-rose-600">{createProposal.error.message}</p>
        ) : null}
        {createProposal.isSuccess ? (
          <p className="text-sm text-emerald-700">Proposal submitted.</p>
        ) : null}
      </div>
    </form>
  );
}

export default CreateTransferProposal;
