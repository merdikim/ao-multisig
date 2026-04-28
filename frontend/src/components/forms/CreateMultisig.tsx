import { useWallet } from "@/context/useWallet";
import { useCreateMultisig } from "@/hooks/useMultisig";
import { Loader2, Plus } from "lucide-react";
import { FormEvent, useState } from "react";

function CreateMultisig() {
  const createMultisig = useCreateMultisig();
  const { isConnected } = useWallet();
  const [name, setName] = useState("");
  const [signers, setSigners] = useState("");
  const [threshold, setThreshold] = useState(1);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const parsedSigners = signers
      .split(/\n|,/)
      .map((signer) => signer.trim())
      .filter(Boolean);

    createMultisig.mutate(
      { name, signers: parsedSigners, threshold },
      {
        onSuccess: () => {
          setName("");
          setSigners("");
          setThreshold(1);
        },
      }
    );
  }

  return (
    <form className="panel p-4" onSubmit={onSubmit}>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-cyan-50 text-cyan-700">
          <Plus size={18} />
        </div>
        <h2 className="font-semibold text-slate-950">Create multisig</h2>
      </div>
      <div className="space-y-3">
        <input
          className="input"
          placeholder="Vault name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
        <textarea
          className="input min-h-24 resize-none"
          placeholder="Signer addresses, separated by comma or line"
          value={signers}
          onChange={(event) => setSigners(event.target.value)}
        />
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-600">
            Approval threshold
          </span>
          <input
            className="input"
            min={1}
            type="number"
            value={threshold}
            onChange={(event) => setThreshold(Number(event.target.value))}
          />
        </label>
        <button
          className="button-primary w-full"
          disabled={createMultisig.isPending || !isConnected}
          type="submit"
        >
          {createMultisig.isPending ? (
            <Loader2 className="animate-spin" size={17} />
          ) : (
            <Plus size={17} />
          )}
          Create vault
        </button>
        {createMultisig.error ? (
          <p className="text-sm text-rose-600">{createMultisig.error.message}</p>
        ) : null}
      </div>
    </form>
  );
}

export default CreateMultisig