// types/bubbles.types.ts
import * as PIXI from "pixi.js";

export enum PriceChangePercentage {
  HOUR = "volume_24h",
  DAY = "volume_7d",
  WEEK = "volume_30d",
  MONTH = "volume_90d",
  YEAR = "collection_score"
}

export type Circle = {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  dragging: boolean;
  targetRadius: number;
  symbol: string;
  coinName: string;
  radius: number;
  [PriceChangePercentage.HOUR]: number;
  [PriceChangePercentage.DAY]: number;
  [PriceChangePercentage.WEEK]: number;
  [PriceChangePercentage.MONTH]: number;
  [PriceChangePercentage.YEAR]: number;
  image: string;
  text2: PIXI.Text | null;
};