import { useWallet } from "@/context/useWallet";
import { useCreateMultisig } from "@/hooks/useMultisig";
import { isArweaveAddress } from "@/utils";
import { Loader2, Plus } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

function CreateMultisig() {
  const createMultisig = useCreateMultisig();
  const { isConnected } = useWallet();
  const [name, setName] = useState("");
  const [signers, setSigners] = useState("");
  const [threshold, setThreshold] = useState(1);
  const signerList = useMemo(() => {
    const unique = new Set(
      signers
        .split(/\n|,/)
        .map((signer) => signer.trim())
        .filter(Boolean)
    );

    return Array.from(unique).filter(isArweaveAddress);
  }, [signers]);
  const validSignerCount = signerList.length;
  const thresholdIsValid = (threshold == 1 && validSignerCount == 0) || (threshold >= 1 && threshold <= validSignerCount)

  function onSubmit(event: FormEvent) {
    event.preventDefault();

    createMultisig.mutate(
      { name, signers: signerList, threshold },
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
            max={Math.max(1, validSignerCount)}
            type="number"
            value={threshold}
            onChange={(event) => setThreshold(Number(event.target.value))}
          />
        </label>
        <button
          className="button-primary w-full"
          disabled={
            createMultisig.isPending ||
            !isConnected ||
            !thresholdIsValid || !name
          }
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
        {isConnected && !thresholdIsValid ? (
          <p className="text-sm text-slate-500">
            Threshold must be between 1 and {Math.max(1, validSignerCount)}.
          </p>
        ) : null}
      </div>
    </form>
  );
}

export default CreateMultisig
