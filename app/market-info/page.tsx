// app/market-info/page.tsx
import { getNFTCollections } from "../page";  // Import the data fetching function from main page
import { NFTCollectionData } from "@/types/nft.types";
import NFTTable from "../ui/NFTTable";

export default async function MarketInfoPage() {
  // Reuse the same data from the main page
  const collections = await getNFTCollections();

  return (
    <div className="container mx-auto py-8">
      <NFTTable collections={collections} />
    </div>
  );
}