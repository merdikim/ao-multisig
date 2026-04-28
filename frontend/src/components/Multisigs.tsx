import { Multisig } from "@/types";
import { shortenAddress } from "@/utils";
import { Landmark } from "lucide-react";

function Multisigs({
  multisigs,
  selected,
  onSelect,
}: {
  multisigs: Multisig[] | undefined;
  selected: Multisig | null;
  onSelect: (multisig: Multisig) => void;
}) {
  return (
    <aside className="panel overflow-hidden">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Multisigs
        </h2>
      </div>
      <div className="divide-y max-h-[40vh] overflow-scroll divide-slate-100">
        {multisigs?.map((multisig) => (
          <button
            key={multisig.processId}
            className={`flex w-full items-start gap-3 px-4 py-4 text-left transition ${
              selected?.processId === multisig.processId
                ? "bg-teal-50"
                : "bg-white hover:bg-slate-50"
            }`}
            onClick={() => onSelect(multisig)}
          >
            <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-900 text-white">
              <Landmark size={18} />
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-950">
                {multisig.name}
              </p>
              <p className="break-all text-xs text-slate-400">
                {shortenAddress(multisig.processId)}
              </p>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}

export default Multisigs