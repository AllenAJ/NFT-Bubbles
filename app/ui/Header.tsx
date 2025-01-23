'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { 
  CircleUser, 
  PieChart, 
  Table2, 
  TrendingUp,
  Moon,
  Sun
} from 'lucide-react';

const Header = () => {
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = React.useState(true);

  const navItems = [
    {
      name: 'Bubbles View',
      href: '/',
      icon: <PieChart className="w-4 h-4" />,
      description: 'Interactive NFT visualization'
    },
    // {
    //   name: 'Table View',
    //   href: '/market-info',
    //   icon: <Table2 className="w-4 h-4" />,
    //   description: 'Detailed NFT analytics'
    // },
    // {
    //   name: 'Analytics',
    //   href: '/analytics',
    //   icon: <TrendingUp className="w-4 h-4" />,
    //   description: 'Market insights'
    // }
  ];

  return (
    <header className="bg-zinc-900 border-b border-zinc-800">
      <div className="max-w-7xl mx-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/logo.png"
              alt="NFT Bubbles Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <div className="hidden md:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                NFT Bubbles
              </h1>
              <p className="text-xs text-zinc-400">
                Interactive NFT Collection Analytics
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                )}
              >
                <div className="flex items-center space-x-2">
                  {item.icon}
                  <span>{item.name}</span>
                </div>
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* <button className="p-2 rounded-full hover:bg-zinc-800 transition-colors">
              <CircleUser className="w-5 h-5 text-zinc-400" />
            </button> */}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;