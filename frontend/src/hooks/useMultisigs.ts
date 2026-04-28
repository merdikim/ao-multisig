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
        processId: "raPdBZ6mC80N70uCd6u5lOJJphDQJYzFF2hCOxMmKp4",
        createdAt: 53875493847
      }, {
        name: "My second long test MTSG",
        processId: "raPdBZ6mC80N70uCd6u5lOJJphDQJYzFF2hCOxMmKp5",
        createdAt: 53875493847
      }, {
        name: "My third super long test to truncate",
        processId: "raPdBZ6mC80N70uCd6u5lOJJphDQJYzFF2hCOxMmKp6",
        createdAt: 53875493847
      }]
    },
  });
}
