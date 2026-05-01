import { hyperbeamUrl, multisigIndexer } from "@/constants";
import { useWallet } from "@/context/useWallet";
import { Multisig } from "@/types";
import { isArweaveAddress } from "@/utils";
import { useQuery } from "@tanstack/react-query";

export function useMultisigs() {
  const { address } = useWallet();

  return useQuery({
    queryKey: ['multisigs', address],
    enabled: !!address,
    staleTime: 2 * 60 * 1000 , //2 minutes
    queryFn: async():Promise<Multisig[]> => {
          if(!isArweaveAddress(multisigIndexer)) {
            throw new Error(" The multisig Id provided is incorrect")
          }
          if(!address || !isArweaveAddress(address)) {
            return []
          }
          const currentSlotUrl = `${hyperbeamUrl}/${multisigIndexer}~process@1.0/slot/current`
          const slotResult = await fetch(currentSlotUrl)
          if (!slotResult.ok) {
            throw new Error(`Could not load ${address}'s wallets`)
          }
          const currentSlot = await slotResult.json()
          const multisigsDataUrl = `${hyperbeamUrl}/${multisigIndexer}~process@1.0/compute=${currentSlot}?accept-bundle=true&require-codec=application/json`
          const multisigsDataResult = await fetch(multisigsDataUrl)
          if (!multisigsDataResult.ok) {
            throw new Error(`Could not load ${address}'s wallets`)
          }
          const { wallets }  = await multisigsDataResult.json()

          const walletsForUser = wallets[address]?.multisigs || {}
          const { commitments: _commitments, ...multisigs } = walletsForUser

          return (Object.values(multisigs) as Multisig[]).sort(
            (a, b) => b.created_at - a.created_at
          )
        },
  });
}
