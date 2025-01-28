'use client';

import { NFTCollectionData } from "@/types/nft.types";
import dynamic from 'next/dynamic';

// Dynamic import of Bubbles component with no SSR
const BubblesComponent = dynamic(
  () => import('./Bubbles'),
  { 
    ssr: false,
    loading: () => null  // Remove loading indicator here as Bubbles handles its own loading state
  }
);

interface Props {
  collections: NFTCollectionData[];
}

function ClientBubbles({ collections }: Props) {
  return <BubblesComponent collections={collections} />;
}

export default ClientBubbles;