// types/nft.types.ts

export interface NFTCollectionMetadata {
  banner_image_url: string | null;
  blockchain: string | null;
  brand: string;
  category: string | null;
  chain_id: string;
  close_colours: string | null;
  collection: string | null;
  collection_id: string;
  contract_address: string;
  contract_created_date: string | null;
  contract_type: string | null;
  description: string | null;
  discord_url: string | null;
  external_url: string | null;
  image_url: string | null;
  instagram_url: string | null;
  marketplace_url: string | null;
  medium_url: string | null;
  telegram_url: string | null;
  twitter_url: string | null;
}

export interface NFTCollectionData {
  id: string;
  name: string;
  image: string;
  symbol: string;
  volume_24h: number;    // Percentage change for last 24h
  volume_7d: number;     // Percentage change for last 7d
  volume_30d: number;    // Percentage change for last 30d
  volume_90d: number;    // Percentage change for last 90d
  collection_score: number;  // Overall score/rating
  metadata: NFTCollectionMetadata;  // Required metadata field
}

export interface APIResponse<T> {
  data: T[];
}

export interface NFTTransaction {
  block_date: string;
  blockchain: string;
  chain_id: number;
  collection: string;
  contract_address: string;
  contract_created_date: string;
  contract_type: string;
  hash: string;
  is_washtrade: string;
  marketplace: string | null;
  receiving_address: string;
  sale_price_usd: number;
  sending_address: string;
  timestamp: string;
  token_id: string;
  transaction_type: string;
}