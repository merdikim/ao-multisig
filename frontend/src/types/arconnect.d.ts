type ArConnectPermission =
  | "ACCESS_ADDRESS"
  | "ACCESS_ALL_ADDRESSES"
  | "SIGN_TRANSACTION"
  | "ENCRYPT"
  | "DECRYPT"
  | "SIGNATURE"
  | "DISPATCH";

type ArConnectWallet = {
  connect: (
    permissions: ArConnectPermission[],
    appInfo?: { name?: string; logo?: string }
  ) => Promise<void>;
  disconnect: () => Promise<void>;
  getActiveAddress: () => Promise<string>;
};

interface Window {
  arweaveWallet?: ArConnectWallet;
}
