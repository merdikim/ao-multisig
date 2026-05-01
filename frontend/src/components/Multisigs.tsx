import { Multisig } from "@/types";
import { formatRelativeTime, shortenAddress } from "@/utils";
import { Clock3, Landmark } from "lucide-react";

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
            key={multisig.process_id}
            className={`flex w-full items-start gap-3 px-4 py-4 text-left transition ${
              selected?.process_id === multisig.process_id
                ? "bg-teal-50/80 shadow-[inset_3px_0_0_#0f766e]"
                : "bg-white hover:bg-slate-50"
            }`}
            onClick={() => onSelect(multisig)}
          >
            <div
              className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
                selected?.process_id === multisig.process_id
                  ? "bg-teal-700 text-white"
                  : "bg-slate-900 text-white"
              }`}
            >
              <Landmark size={18} />
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-950">
                {multisig.name}
              </p>
              {/* <p className="break-all text-xs text-slate-400">
                {shortenAddress(multisig.process_id)}
              </p> */}
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
                <Clock3 size={13} />
                {formatRelativeTime(multisig.created_at)}
              </p>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}

export default Multisigs
