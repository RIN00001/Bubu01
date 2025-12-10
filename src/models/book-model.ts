export interface CreateBookRequest {
  name: string;
  program?: string;
  walletIds?: number[];
}

export interface UpdateBookRequest {
  name?: string;
  program?: string;
  walletIds?: number[];
}
