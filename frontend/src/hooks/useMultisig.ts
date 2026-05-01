import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  sendAddSigner,
  sendCreateMultisig,
  sendTransferProposal,
  sendRemoveSigner,
  sendVote,
} from "@/lib/aoClient";
import { useWallet } from "@/context/useWallet";
import type { CreateMultisigInput, CreateProposalInput, MultisigData, Vote } from "@/types";
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
      const proposals = multisig_info.proposals || []
      const signers = multisig_info.signers || {}
      const { commitments: _commitments, ...validSigners } = signers
      const threshold = Number(multisig_info.threshold || 1)

      return {
        processId: multisigId,
        name: multisig_info.name || "Unnamed multisig",
        threshold,
        signers: Object.keys(validSigners),
        proposals: proposals || [],
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

      const res = await sendCreateMultisig(input);
      if (res?.isError) {
        throw new Error(res.error);
      }

      return res?.message || 'success';
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKey });
      queryClient.invalidateQueries({ queryKey: ["multisigs"] });
    },
  });
}

export function useSendTransferProposal() {
  const queryClient = useQueryClient();
  const { isConnected } = useWallet();

  return useMutation({
    mutationFn: async (input: CreateProposalInput) => {
      if (!isConnected) {
        throw new Error("Connect Wander wallet before creating a proposal.");
      }

      const result = await sendTransferProposal(input);
      if(result?.isError) {
        throw new Error(result.error)
      }
      return true
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: dashboardKey }),
  });
}

export function useVote() {
  const queryClient = useQueryClient();
  const { isConnected } = useWallet();

  return useMutation({
    mutationFn: async (input: {
      multisigId: string;
      proposalId: number;
      vote: Vote;
    }) => {
      if (!isConnected) {
        throw new Error("Connect Wander wallet before voting.");
      }

      const result = await sendVote(
        input.multisigId,
        input.proposalId,
        input.vote
      );
      if (result?.isError) {
        throw new Error(result.error);
      }

      return true;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: dashboardKey }),
  });
}

export function useAddSigner() {
  const queryClient = useQueryClient();
  const { isConnected } = useWallet();

  return useMutation({
    mutationFn: async (input: { multisigId: string; address: string }) => {
      if (!isConnected) {
        throw new Error("Connect Wander wallet before adding a signer.");
      }

      if (!isArweaveAddress(input.address)) {
        throw new Error("Enter a valid Arweave wallet address.");
      }

      const result = await sendAddSigner(input.multisigId, input.address);
      if (result?.isError) {
        throw new Error(result.error);
      }

      return true;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: dashboardKey }),
  });
}

export function useRemoveSigner() {
  const queryClient = useQueryClient();
  const { isConnected } = useWallet();

  return useMutation({
    mutationFn: async (input: { multisigId: string; address: string }) => {
      if (!isConnected) {
        throw new Error("Connect Wander wallet before removing a signer.");
      }

      if (!isArweaveAddress(input.address)) {
        throw new Error("Signer address is invalid.");
      }

      const result = await sendRemoveSigner(input.multisigId, input.address);
      if (result?.isError) {
        throw new Error(result.error);
      }

      return true;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: dashboardKey }),
  });
}
