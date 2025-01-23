import { APIResponse, NFTCollectionData, NFTCollectionMetadata } from "@/types/nft.types";
import dynamic from 'next/dynamic';
import NFTTable from "./ui/NFTTable";

const ClientBubbles = dynamic(
  () => import('./ui/Bubbles/ClientBubbles'),
  { ssr: false }
);

const dynamicConfig = "force-dynamic";
export { dynamicConfig as dynamic };

async function getRandomOffset(): Promise<number> {
  return Math.floor(Math.random() * 10000);
}

async function fetchCollectionData(offset: number): Promise<NFTCollectionMetadata[]> {
  const options = {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'x-api-key': '316dd88ae8840897e1f61160265d1a3f'
    }
  };

  try {
    const res = await fetch(
      `https://api.unleashnfts.com/api/v2/nft/collection/metadata?sort_order=desc&offset=${offset}&limit=30`,
      options
    );

    if (!res.ok) {
      console.error(`Failed to fetch data for offset ${offset}`);
      return [];
    }

    const response: APIResponse<NFTCollectionMetadata> = await res.json();
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching data for offset ${offset}:`, error);
    return [];
  }
}

// Added export keyword here
export async function getNFTCollections(): Promise<NFTCollectionData[]> {
  try {
    const numberOfBatches = 5;
    const randomOffsets = await Promise.all(
      Array(numberOfBatches).fill(null).map(() => getRandomOffset())
    );

    console.log('Using random offsets:', randomOffsets);

    const allMetadataArrays = await Promise.all(
      randomOffsets.map(offset => fetchCollectionData(offset))
    );

    const processedArrays = allMetadataArrays.map(arr => {
      const validCollections = arr.filter(metadata =>
        metadata?.collection &&
        metadata.collection.trim() !== '' &&
        metadata.collection !== 'null' &&
        metadata.collection !== 'undefined'
      );

      return validCollections.slice(0, 20);
    });

    const metadataList = processedArrays.flat();

    randomOffsets.forEach((offset, index) => {
      console.log(`Offset ${offset} produced ${processedArrays[index].length} valid collections`);
    });

    const generateRandomChange = () => {
      return Math.random() * 2000 - 1000;
    };

    const formatCollectionName = (metadata: NFTCollectionMetadata): string => {
      if (!metadata.collection || metadata.collection.trim() === '') {
        throw new Error('Collection name is invalid');
      }
      return metadata.collection.slice(0, 4).toUpperCase();
    };

    const usedNames = new Set<string>();

    const collections: NFTCollectionData[] = metadataList.map(metadata => {
      const shortName = formatCollectionName(metadata);

      let uniqueName = shortName;
      let counter = 1;
      while (usedNames.has(uniqueName)) {
        uniqueName = `${shortName}${counter}`;
        counter++;
      }
      usedNames.add(uniqueName);

      return {
        id: metadata.contract_address,
        name: uniqueName,
        symbol: uniqueName,
        image: metadata.image_url ||
               `https://pbs.twimg.com/media/FNf8P5AVEAEytt-.png`,
        volume_24h: generateRandomChange(),
        volume_7d: generateRandomChange(),
        volume_30d: generateRandomChange(),
        volume_90d: generateRandomChange(),
        collection_score: Math.abs(generateRandomChange()),
        metadata
      };
    });

    console.log(`Total collections with names: ${collections.length}`);
    console.log('Sample collections:',
      collections.slice(0, 5).map(c => ({
        name: c.name,
        originalName: c.metadata.collection,
        imageUrl: c.image
      }))
    );

    const shuffled = [...collections].sort(() => Math.random() - 0.5);

    return shuffled
      .sort((a, b) => Math.abs(b.volume_24h) - Math.abs(a.volume_24h))
      .slice(0, 100);

  } catch (error) {
    console.error('Error fetching NFT data:', error);
    throw error;
  }
}

export default async function Main() {
  try {
    const collections = await getNFTCollections();

    if (!collections.length) {
      return (
        <div className="flex justify-center items-center h-screen text-white">
          <h1>No collections available</h1>
        </div>
      );
    }

    return (
      <>
        <ClientBubbles collections={collections} />
        <NFTTable collections={collections} />
      </>
    );
      
  } catch (error) {
    console.error('Error in Main component:', error);
    return (
      <div className="flex justify-center items-center h-screen text-white">
        <h1>Error loading collections. Please try again later.</h1>
      </div>
    );
  }
}

