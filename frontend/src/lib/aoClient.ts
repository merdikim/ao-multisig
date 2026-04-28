import {connect, createDataItemSigner} from "@permaweb/aoconnect"
import type { CreateMultisigInput, CreateProposalInput, Vote, Tag, SendActionInput } from "@/types";
import { isArweaveAddress } from "@/utils";
import { hyperbeamUrl, scheduler } from "@/constants";

const { message, result} = connect(
  {MODE:"mainnet", SCHEDULER:scheduler, URL:hyperbeamUrl, signer: createDataItemSigner(window.arweaveWallet)}
)
const configuredIndexerProcessId = import.meta.env.VITE_INDEXER_PROCESS_ID as
  | string
  | undefined;


function getSigner() {
  if (!window.arweaveWallet) {
    throw new Error("ArConnect wallet is not available.");
  }
  return createDataItemSigner(window.arweaveWallet);
}

async function checkResult(process:string, messageId:string) {
  const { Messages } = await result({ process, message: messageId })
  if(Messages.length == 0) {
    return {
      isError: false,
      error: ''
    }
  }
  const error = Messages[0].Tags.find((tag:Tag) => tag.name == "Error")
  return {
    isError:true,
    error: error.value
  }
 
}

async function sendAction({process, action, tags = [], data}: SendActionInput) {
  
  const messageId = await message({
    process,
    signer: getSigner(),
    tags: [{ name: "Action", value: action }, ...tags] satisfies Tag[],
    data: data,
  });

  return messageId
}

export async function sendCreateMultisig(input: CreateMultisigInput) {
  if (!configuredIndexerProcessId) {
    return undefined;
  }

  return sendAction({
    process: configuredIndexerProcessId,
    action: "Create-Multisig",
    data: JSON.stringify({
      name: input.name,
      signers: input.signers,
      threshold: input.threshold,
    }),
  });
}

export async function sendCreateProposal(input: CreateProposalInput) {
  if (!isArweaveAddress(input.multisigId)) {
    return undefined;
  }

  const hoursToMs = input.durationHours * 60 * 60 * 1000;

  const action = {
    process: input.multisigId,
    action: "Create-Proposal",
    data: JSON.stringify({
      description: input.description,
      endTime: Date.now() + hoursToMs
    })
  }

  const messageId = await sendAction(action)
  const result = await checkResult(input.multisigId, messageId)
  return result
}

export async function sendVoteProposal(
  multisigId: string,
  proposalId: number,
  vote: Vote
) {
  if (!isArweaveAddress(multisigId)) {
    return undefined;
  }

  const action = {
    process: multisigId,
    action: "Vote-Proposal",
    data: JSON.stringify({
      proposalId,
      vote
    })
  }

  return sendAction(action);
}

export async function sendAddSigner(multisigId: string, address: string) {
  if (!isArweaveAddress(multisigId)) {
    return undefined;
  }

  const action = {
    process: multisigId,
    action: "Add-Signer",
    data: JSON.stringify({
      address
    })
  }

  return sendAction(action);
}

export async function sendRemoveSigner(multisigId: string, address: string) {
  if (!isArweaveAddress(multisigId)) {
    return undefined;
  }

  const action = {
    process: multisigId,
    action: "Remove-Signer",
    data: JSON.stringify({
      address
    })
  }

  return sendAction(action);
}
