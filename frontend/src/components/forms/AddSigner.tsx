import { useWallet } from "@/context/useWallet";
import { useAddSigner } from "@/hooks/useMultisig";
import { isArweaveAddress } from "@/utils";
import { Loader2, UserPlus } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

type AddSignerProps = {
  multisigId: string;
  signers: string[];
};

function AddSigner({ multisigId, signers }: AddSignerProps) {
  const addSigner = useAddSigner();
  const { isConnected } = useWallet();
  const [address, setAddress] = useState("");

  const trimmedAddress = address.trim();
  const addressExists = useMemo(
    () => signers.includes(trimmedAddress),
    [signers, trimmedAddress]
  );
  const canSubmit =
    isConnected &&
    isArweaveAddress(trimmedAddress) &&
    !addressExists &&
    !addSigner.isPending;

  function onSubmit(event: FormEvent) {
    event.preventDefault();

    addSigner.mutate(
      { multisigId, address: trimmedAddress },
      {
        onSuccess: () => {
          setAddress("");
        },
      }
    );
  }

  return (
    <form className="panel p-4" onSubmit={onSubmit}>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
          <UserPlus size={18} />
        </div>
        <h2 className="font-semibold text-slate-950">Add signer</h2>
      </div>
      <div className="space-y-3">
        <input
          className="input"
          placeholder="Signer wallet address"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          maxLength={43}
          required
        />
        <button className="button-primary w-full" disabled={!canSubmit} type="submit">
          {addSigner.isPending ? (
            <Loader2 className="animate-spin" size={17} />
          ) : (
            <UserPlus size={17} />
          )}
          Add signer
        </button>
        {!isConnected ? (
          <p className="text-sm text-slate-500">
            Connect your wallet to add a signer.
          </p>
        ) : null}
        {trimmedAddress && !isArweaveAddress(trimmedAddress) ? (
          <p className="text-sm text-slate-500">
            Arweave addresses are 43 characters.
          </p>
        ) : null}
        {addressExists ? (
          <p className="text-sm text-rose-600">This signer is already added.</p>
        ) : null}
        {addSigner.error ? (
          <p className="text-sm text-rose-600">{addSigner.error.message}</p>
        ) : null}
        {addSigner.isSuccess ? (
          <p className="text-sm text-emerald-700">Signer added.</p>
        ) : null}
      </div>
    </form>
  );
}

export default AddSigner;
