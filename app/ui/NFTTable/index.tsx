'use client';

import React, { useState } from 'react';
import { NFTCollectionData } from "@/types/nft.types";
import { Copy, ExternalLink, MessageCircle, Twitter, Check } from 'lucide-react';
import clsx from 'clsx';
import Image from 'next/image';

interface NFTTableProps {
  collections: NFTCollectionData[];
}

const getNetworkImage = (blockchain: string | null) => {
  switch(blockchain?.toLowerCase()) {
    case 'ethereum':
      return '/network/ethereum.png';
    case 'binance':
    case 'bnb':
    case 'bsc':
      return '/network/bnb.png';
    case 'polygon':
      return '/network/polygon.png';
    case 'solana':
      return '/network/solana.png';
    default:
      return '/network/ethereum.png';
  }
};

const NFTTable = ({ collections }: NFTTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'volume_24h',
    direction: 'desc'
  });
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const sortedCollections = React.useMemo(() => {
    const filtered = collections.filter(collection => {
      const nameMatch = collection.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const metadataMatch = collection.metadata?.collection?.toLowerCase().includes(searchTerm.toLowerCase());
      const contractMatch = collection.metadata?.contract_address?.toLowerCase().includes(searchTerm.toLowerCase());
      return nameMatch || metadataMatch || contractMatch;
    });

    return [...filtered].sort((a: any, b: any) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [collections, searchTerm, sortConfig]);

  const requestSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const truncateAddress = (address: string) => {
    if (!address) return 'N/A';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const SortableHeader = ({ label, sortKey }: { label: string, sortKey: string }) => (
    <div 
      className="flex items-center cursor-pointer hover:bg-zinc-700 px-2 py-1 rounded"
      onClick={() => requestSort(sortKey)}
    >
      {label}
      <svg 
        className="ml-2 h-4 w-4" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    </div>
  );

  return (
    <div className="p-4 space-y-4">
      <div className="relative">
        <svg
          className="absolute left-3 top-3 h-4 w-4 text-zinc-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search collections by name, symbol, or contract address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-zinc-500"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="min-w-full divide-y divide-zinc-800">
          <thead className="bg-zinc-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Collection Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Network & Contract
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                <SortableHeader label="24h Volume" sortKey="volume_24h" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                <SortableHeader label="7d Volume" sortKey="volume_7d" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                <SortableHeader label="30d Volume" sortKey="volume_30d" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                <SortableHeader label="90d Volume" sortKey="volume_90d" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                <SortableHeader label="Score" sortKey="collection_score" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Links
              </th>
            </tr>
          </thead>
          <tbody className="bg-zinc-800 divide-y divide-zinc-700">
            {sortedCollections.map((collection) => (
              <tr key={`${collection.id}-${collection.metadata.contract_address}`} className="hover:bg-zinc-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <img
                      src={collection.image}
                      alt={collection.name}
                      className="w-10 h-10 rounded-lg object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://pbs.twimg.com/media/FNf8P5AVEAEytt-.png';
                      }}
                      loading="lazy"
                    />
                    <div>
                      <div className="font-medium text-white">
                        {collection.metadata.collection || collection.name}
                      </div>
                      <div className="text-sm text-zinc-400">
                        {collection.symbol}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <Image
                      src={getNetworkImage(collection.metadata.blockchain)}
                      alt={collection.metadata.blockchain || 'Network'}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                    <div className="text-sm">
                      <div className="text-zinc-300 flex items-center space-x-2">
                        <span>{truncateAddress(collection.metadata.contract_address)}</span>
                        <button
                          onClick={() => handleCopyAddress(collection.metadata.contract_address)}
                          className="p-1 hover:bg-zinc-600 rounded transition-colors"
                        >
                          {copiedAddress === collection.metadata.contract_address ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4 text-zinc-400" />
                          )}
                        </button>
                      </div>
                      <div className="text-zinc-500 text-xs">
                        Created: {formatDate(collection.metadata.contract_created_date)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className={clsx(
                  "px-6 py-4 whitespace-nowrap",
                  collection.volume_24h >= 0 ? 'text-green-500' : 'text-red-500'
                )}>
                  {formatPercentage(collection.volume_24h)}
                </td>
                <td className={clsx(
                  "px-6 py-4 whitespace-nowrap",
                  collection.volume_7d >= 0 ? 'text-green-500' : 'text-red-500'
                )}>
                  {formatPercentage(collection.volume_7d)}
                </td>
                <td className={clsx(
                  "px-6 py-4 whitespace-nowrap",
                  collection.volume_30d >= 0 ? 'text-green-500' : 'text-red-500'
                )}>
                  {formatPercentage(collection.volume_30d)}
                </td>
                <td className={clsx(
                  "px-6 py-4 whitespace-nowrap",
                  collection.volume_90d >= 0 ? 'text-green-500' : 'text-red-500'
                )}>
                  {formatPercentage(collection.volume_90d)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-white">
                  {collection.collection_score.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    {collection.metadata.marketplace_url && (
                      <a
                        href={collection.metadata.marketplace_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-400 hover:text-white transition-colors"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                    {collection.metadata.twitter_url && (
                      <a
                        href={collection.metadata.twitter_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-400 hover:text-white transition-colors"
                      >
                        <Twitter size={16} />
                      </a>
                    )}
                    {collection.metadata.discord_url && (
                      <a
                        href={collection.metadata.discord_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-400 hover:text-white transition-colors"
                      >
                        <MessageCircle size={16} />
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NFTTable;