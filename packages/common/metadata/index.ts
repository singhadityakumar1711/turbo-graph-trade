export type NodeKind =
  | "price-trigger"
  | "time-trigger"
  | "hyperliquid"
  | "backpack"
  | "lighter";

export interface NodeType {
  type: NodeKind;
  data: {
    kind: "action" | "trigger";
    metadata: any;
  };
  id: string;
  position: { x: number; y: number };
}

export interface Edge {
  id: string;
  source: string;
  target: string;
}

// Asset Types
export const SUPPORTED_ASSETS = ["SOL", "BTC", "ETH"] as const;
export type SupportedAsset = (typeof SUPPORTED_ASSETS)[number];

// Trading Types
export type TradingType = "LONG" | "SHORT";

export type TradingMetadata = {
  type: TradingType;
  qty: number;
  symbol: SupportedAsset;
};

// Trigger Types
export type PriceTriggerNodeMetadata = {
  asset: SupportedAsset;
  price: number;
};

export type TimerTriggerNodeMetadata = {
  time: number;
};

