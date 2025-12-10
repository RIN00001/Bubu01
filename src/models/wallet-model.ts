export interface CreateWalletRequest {
  name: string;
  balance?: number;   
}

export interface UpdateWalletRequest {
  name?: string;
  balance?: number;
}

export interface WalletResponse {
  id: number;
  name: string;
  balance: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
