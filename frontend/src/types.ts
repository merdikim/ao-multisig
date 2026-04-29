export type Vote = "yes" | "no";

export type ProposalStatus = "active" | "approved" | "rejected" | "expired";

export type Tag = {
  name: string;
  value: string;
};

export type Signer = {
  address: string;
  label: string;
};

export type Proposal = {
  id: number;
  description: string;
  startTime: number;
  endTime: number;
  threshold: number;
  executed: string;
  rejected: string;
  votes: Record<string, Vote>;
};

export type Multisig = {
  processId: string;
  name: string;
  createdAt: number;
};

export type MultisigData = {
  processId: string;
  name: string;
  threshold: number;
  proposals: Proposal[];
  signers: string[];
}

export type WalletSummary = {
  address: string;
  multisigs: Pick<Multisig, "processId" | "name" | "createdAt">[];
};

export type Dashboard = {
  wallet: WalletSummary;
  multisigs: Multisig[];
};

export type CreateMultisigInput = {
  name: string;
  signers: string[];
  threshold: number;
};

export type CreateProposalInput = {
  multisigId: string;
  description: string;
  durationHours: number;
};

export type SendActionInput = {
  process: string
  action: string 
  tags?: Tag[]
  data?: string
}
