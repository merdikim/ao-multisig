import { useWallet } from "@/context/useWallet";
import { useQuery } from "@tanstack/react-query";

export function useMultisigs() {
  const { address, isConnected } = useWallet();

  return useQuery({
    queryKey: ['multisigs', address],
    enabled: !!address,
    queryFn: async() => {
      if(!isConnected || !address) {
        throw new Error(" No wallet connected")
      }
      // const url = `${hyperbeamUrl}/${multisigId}/state`
      // const result = await fetch(url)
      // console.log(result)
      // const multisigs = await result.json()
      // console.log(multisigs)
      return [{
        name: "My test MTSG",
        processId: "7c7kJO2K1LQgTtfKy-tWLVpqYph04c-3r_KD0USkwpQ",
        createdAt: 53875493847
      }, {
        name: "My second long test MTSG",
        processId: "7c7kJO2K1LQgTtfKy-tWLVpqYph04c-3r_KD0USkwph",
        createdAt: 53875493847
      }, {
        name: "My third super long test to truncate",
        processId: "7c7kJO2K1LQgTtfKy-tWLVpqYph04c-3r_KD0USkwpz",
        createdAt: 53875493847
      }]
    },
  });
}
