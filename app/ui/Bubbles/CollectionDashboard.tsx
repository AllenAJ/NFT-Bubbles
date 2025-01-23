// CollectionDashboard.tsx
import React, { useEffect, useState } from 'react';
import { NFTCollectionData } from '@/types/nft.types';
import { X, ExternalLink, Twitter, MessageCircle } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, RadialBarChart, RadialBar, Legend } from 'recharts';

const COLORS = {
  green: '#10B981',
  red: '#EF4444',
  yellow: '#F59E0B',
  blue: '#3B82F6',
  purple: '#8B5CF6'
};

interface ProfileData {
  avg_loss_making_trades: number;
  avg_profitable_trades: number;
  collection_score: number;
  diamond_hands: string;
  fear_and_greed_index: number;
  holder_metrics_score: number;
  liquidity_score: number;
  loss_making_trades: string;
  loss_making_trades_percentage: number;
  loss_making_volume: number;
  market_dominance_score: number;
  metadata_score: number;
  profitable_trades: string;
  profitable_trades_percentage: number;
  profitable_volume: number;
  token_distribution_score: number;
  washtrade_index: number;
  zero_profit_trades: string;
}

interface CollectionDashboardProps {
  collection: NFTCollectionData | null;
  isOpen: boolean;
  onClose: () => void;
}

const CollectionDashboard = ({ collection, isOpen, onClose }: CollectionDashboardProps) => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!collection?.metadata.contract_address) return;
      
      setLoading(true);
      try {
        const response = await fetch(
          `https://api.unleashnfts.com/api/v2/nft/collection/profile?blockchain=${collection.metadata.blockchain || 'ethereum'}&contract_address=${collection.metadata.contract_address}&time_range=all&offset=0&limit=30&sort_by=washtrade_index&sort_order=desc`,
          {
            headers: {
              'accept': 'application/json',
              'x-api-key': '316dd88ae8840897e1f61160265d1a3f'
            }
          }
        );
        
        const data = await response.json();
        if (data.data && data.data[0]) {
          setProfileData(data.data[0]);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && collection) {
      fetchProfileData();
    }
  }, [isOpen, collection]);

  if (!isOpen || !collection) return null;

  const metrics = [
    { label: '24h Volume Change', value: `${collection.volume_24h.toFixed(2)}%` },
    { label: '7d Volume Change', value: `${collection.volume_7d.toFixed(2)}%` },
    { label: '30d Volume Change', value: `${collection.volume_30d.toFixed(2)}%` },
    { label: '90d Volume Change', value: `${collection.volume_90d.toFixed(2)}%` },
    { label: 'Collection Score', value: collection.collection_score.toFixed(2) }
  ];

  const metadata = collection.metadata;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-zinc-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-zinc-700"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-zinc-700 flex justify-between items-center sticky top-0 bg-zinc-900">
          <h2 className="text-xl font-bold text-white">
            {metadata.collection || collection.name}
          </h2>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors p-2"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid gap-6">
          {/* Banner Image */}
          {metadata.banner_image_url && (
            <div className="relative w-full h-48 overflow-hidden rounded-lg">
              <img 
                src={metadata.banner_image_url} 
                alt="Collection Banner"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Preview and Description */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Collection Preview */}
            <div className="bg-zinc-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Collection Preview</h3>
              <div className="flex justify-center">
                <div className="relative w-full max-w-md h-48">
                  <img 
                    src={collection.image} 
                    alt={collection.name}
                    className="w-full h-full object-contain rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://pbs.twimg.com/media/FNf8P5AVEAEytt-.png';
                    }}
                    style={{
                      opacity: '0',
                      transition: 'opacity 0.3s ease-in-out'
                    }}
                    onLoad={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.opacity = '1';
                    }}
                  />
                  <div 
                    className="absolute inset-0 bg-zinc-800 rounded-lg animate-pulse"
                    style={{ zIndex: -1 }}
                  />
                </div>
              </div>
            </div>

            {/* Collection Info */}
            <div className="bg-zinc-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Collection Info</h3>
              <div className="space-y-3">
                {metadata.description && (
                  <div className="text-zinc-300 text-sm">
                    {metadata.description}
                  </div>
                )}
                <div className="pt-2 space-y-2">
                  {metadata.blockchain && (
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Blockchain</span>
                      <span className="text-zinc-200">{metadata.blockchain}</span>
                    </div>
                  )}
                  {metadata.contract_type && (
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Contract Type</span>
                      <span className="text-zinc-200">{metadata.contract_type}</span>
                    </div>
                  )}
                  {metadata.contract_created_date && (
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Created</span>
                      <span className="text-zinc-200">
                        {new Date(metadata.contract_created_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="bg-zinc-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">External Links</h3>
            <div className="flex flex-wrap gap-4">
              {metadata.marketplace_url && (
                <a
                  href={metadata.marketplace_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-700 rounded-lg hover:bg-zinc-600 transition-colors"
                >
                  <ExternalLink size={16} />
                  <span>OpenSea</span>
                </a>
              )}
              {metadata.twitter_url && (
                <a
                  href={metadata.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-700 rounded-lg hover:bg-zinc-600 transition-colors"
                >
                  <Twitter size={16} />
                  <span>Twitter</span>
                </a>
              )}
              {metadata.discord_url && (
                <a
                  href={metadata.discord_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-700 rounded-lg hover:bg-zinc-600 transition-colors"
                >
                  <MessageCircle size={16} />
                  <span>Discord</span>
                </a>
              )}
            </div>
          </div>

          {/* Contract Info */}
          <div className="bg-zinc-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Contract Details</h3>
            <div className="bg-zinc-900 p-3 rounded-lg break-all font-mono text-sm">
              {metadata.contract_address}
            </div>
          </div>

          {/* Profile Data */}
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : profileData ? (
            <>
              {/* Collection Health */}
              <div className="bg-zinc-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Collection Health</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-zinc-400 mb-2">Core Metrics</h4>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart 
                          cx="50%" 
                          cy="50%" 
                          innerRadius="20%" 
                          outerRadius="80%" 
                          data={[
                            { name: 'Collection Score', value: profileData.collection_score, fill: COLORS.blue },
                            { name: 'Liquidity Score', value: profileData.liquidity_score, fill: COLORS.green },
                            { name: 'Market Dominance', value: profileData.market_dominance_score, fill: COLORS.purple }
                          ]} 
                          startAngle={180} 
                          endAngle={0}
                        >
                          <RadialBar
                            background
                            dataKey="value"
                            label={{ fill: '#fff', position: 'insideStart' }}
                          />
                          <Legend />
                          <Tooltip />
                        </RadialBarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-zinc-400 mb-2">Trading Analysis</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Fear & Greed Index</span>
                        <span className="text-yellow-500">{profileData.fear_and_greed_index.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Wash Trade Index</span>
                        <span className="text-red-500">{profileData.washtrade_index.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Diamond Hands</span>
                        <span className="text-purple-500">{profileData.diamond_hands}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trading Activity */}
              <div className="bg-zinc-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Trading Activity</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Trading Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-zinc-700/50 rounded-lg">
                      <div className="text-green-500 text-lg font-semibold">{profileData.profitable_trades}</div>
                      <div className="text-sm text-zinc-400">Profitable Trades</div>
                      <div className="text-xs text-zinc-500">{profileData.profitable_trades_percentage.toFixed(2)}%</div>
                    </div>
                    <div className="p-3 bg-zinc-700/50 rounded-lg">
                      <div className="text-red-500 text-lg font-semibold">{profileData.loss_making_trades}</div>
                      <div className="text-sm text-zinc-400">Loss Making Trades</div>
                      <div className="text-xs text-zinc-500">{profileData.loss_making_trades_percentage.toFixed(2)}%</div>
                    </div>
                    <div className="p-3 bg-zinc-700/50 rounded-lg">
                      <div className="text-yellow-500 text-lg font-semibold">{profileData.zero_profit_trades}</div>
                      <div className="text-sm text-zinc-400">Zero Profit Trades</div>
                    </div>
                  </div>

                  {/* Trading Distribution Pie Chart */}
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Profitable', value: Number(profileData.profitable_trades) },
                            { name: 'Loss Making', value: Number(profileData.loss_making_trades) },
                            { name: 'Zero Profit', value: Number(profileData.zero_profit_trades) }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill={COLORS.green} />
                          <Cell fill={COLORS.red} />
                          <Cell fill={COLORS.yellow} />
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Volume Bar Chart */}
                {/* <div className="mt-4 h-72">
                  <h4 className="text-sm font-medium text-zinc-400 mb-2">Trading Volume Analysis</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Loss Making Volume', value: Math.abs(profileData.loss_making_volume), fill: COLORS.red },
                      { name: 'Profitable Volume', value: profileData.profitable_volume, fill: COLORS.green },
                    ]}>
                      <Tooltip />
                      <Bar dataKey="value" fill={COLORS.blue}>
                        {[
                          <Cell key="cell-0" fill={COLORS.red} />,
                          <Cell key="cell-1" fill={COLORS.green} />
                        ]}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div> */}
              </div>
            </>
          ) : null}

          {/* Metrics */}
          <div className="bg-zinc-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
            <div className="space-y-3">
              {metrics.map((metric, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-zinc-400">{metric.label}</span>
                  <span className={metric.value.includes('-') ? 'text-red-500' : 'text-green-500'}>
                    {metric.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionDashboard;