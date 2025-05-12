export interface Vault {
  id: string | null;
  name: string | null;
  createdAt: Date | null;
  role: "OWNER" | "EDITOR" | "VIEWER";
}
