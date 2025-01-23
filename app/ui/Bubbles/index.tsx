import { NFTCollectionData } from "@/types/nft.types";
import Bubbles from "./Bubbles";

interface Props {
  collections: NFTCollectionData[];
}

export default function BubblesPage({ collections }: Props) {
  return <Bubbles collections={collections} />;
}