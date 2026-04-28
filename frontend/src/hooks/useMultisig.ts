import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  sendCreateMultisig,
  sendCreateProposal,
} from "@/lib/aoClient";
import { useWallet } from "@/context/useWallet";
import type { CreateMultisigInput, CreateProposalInput, MultisigData, Proposal } from "@/types";
import { hyperbeamUrl } from "@/constants";
import { isArweaveAddress } from "@/utils";

const dashboardKey = ["multisig"];

export function useMultisig(multisigId:string) {
  return useQuery({
    queryKey: [...dashboardKey, multisigId],
    enabled: Boolean(multisigId),
    queryFn: async():Promise<MultisigData> => {
      if(!isArweaveAddress(multisigId)) {
        throw new Error(" The multisig Id provided is incorrect")
      }
      const currentSlotUrl = `${hyperbeamUrl}/${multisigId}~process@1.0/slot/current`
      const slotResult = await fetch(currentSlotUrl)
      if (!slotResult.ok) {
        throw new Error("Could not load the current multisig slot.")
      }
      const currentSlot = await slotResult.json()
      const multisigDataUrl = `${hyperbeamUrl}/${multisigId}~process@1.0/compute=${currentSlot}?accept-bundle=true&require-codec=application/json`
      const multisigDataResult = await fetch(multisigDataUrl)
      if (!multisigDataResult.ok) {
        throw new Error("Could not load multisig data.")
      }
      const {multisig_info} = await multisigDataResult.json()
      const rawProposals = multisig_info.Proposals || multisig_info.proposals || []
      const rawSigners = multisig_info.Signers || multisig_info.signers || []

      return {
        processId: multisigId,
        name: multisig_info.Name || multisig_info.name || "Unnamed multisig",
        threshold: Number(multisig_info.threshold || multisig_info.treshold || 1),
        signers: Array.isArray(rawSigners) ? rawSigners : Object.keys(rawSigners),
        proposals: Array.isArray(rawProposals)
          ? rawProposals
          : (Object.values(rawProposals) as Proposal[]),
      } satisfies MultisigData
    },
  });
}

export function useCreateMultisig() {
  const queryClient = useQueryClient();
  const { isConnected } = useWallet();

  return useMutation({
    mutationFn: async (input: CreateMultisigInput) => {
      if (!isConnected) {
        throw new Error("Connect Wander wallet before creating a multisig.");
      }

      await sendCreateMultisig(input);
      //return createMultisig(input, address);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: dashboardKey }),
  });
}

export function useCreateProposal() {
  const queryClient = useQueryClient();
  const { isConnected } = useWallet();

  return useMutation({
    mutationFn: async (input: CreateProposalInput) => {
      if (!isConnected) {
        throw new Error("Connect Wander wallet before creating a proposal.");
      }

      return sendCreateProposal(input);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: dashboardKey }),
  });
}

// export function useVoteProposal() {
//   const queryClient = useQueryClient();
//   const { isConnected } = useWallet();

//   return useMutation({
//     mutationFn: async (input: {
//       multisigId: string;
//       proposalId: number;
//       vote: Vote;
//     }) => {
//       if (!isConnected) {
//         throw new Error("Connect Wander wallet before voting.");
//       }

//       await sendVoteProposal(input.multisigId, input.proposalId, input.vote);
//       return voteProposal(input.multisigId, input.proposalId, input.vote);
//     },
//     onSuccess: () => queryClient.invalidateQueries({ queryKey: dashboardKey }),
//   });
// }

// export function useAddSigner() {
//   const queryClient = useQueryClient();
//   const { isConnected } = useWallet();

//   return useMutation({
//     mutationFn: async (input: { multisigId: string; address: string }) => {
//       if (!isConnected) {
//         throw new Error("Connect Wander wallet before adding a signer.");
//       }

//       await sendAddSigner(input.multisigId, input.address);
//       return addSigner(input.multisigId, input.address);
//     },
//     onSuccess: () => queryClient.invalidateQueries({ queryKey: dashboardKey }),
//   });
// }

// export function useRemoveSigner() {
//   const queryClient = useQueryClient();
//   const { isConnected } = useWallet();

//   return useMutation({
//     mutationFn: async (input: { multisigId: string; address: string }) => {
//       if (!isConnected) {
//         throw new Error("Connect Wander wallet before removing a signer.");
//       }

//       await sendRemoveSigner(input.multisigId, input.address);
//       return removeSigner(input.multisigId, input.address);
//     },
//     onSuccess: () => queryClient.invalidateQueries({ queryKey: dashboardKey }),
//   });
// }
