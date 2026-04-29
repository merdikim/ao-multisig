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
        processId: "Vy-qLLb1jmLs2HonJmfVcc-9iL3Phk1mtP84zJuLlZM",
        createdAt: 53875493847
      }]
    },
  });
}
