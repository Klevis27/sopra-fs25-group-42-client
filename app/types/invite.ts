export type VaultInvite = {
    id: number;
    token: string;
    vaultName: string;
    role: "EDITOR" | "VIEWER";
    createdAt: string;
  };