# .eslintrc.json

```json
{
  "extends": "next/core-web-vitals"
}

```

# .gitignore

```
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# env
.env


```

# .vscode/launch.json

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "pnpm dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    },
    {
      "name": "Next.js: debug full stack",
      "type": "node-terminal",
      "request": "launch",
      "command": "pnpm dev",
      "serverReadyAction": {
        "pattern": "started server on .+, url: (https?://.+)",
        "uriFormat": "%s",
        "action": "debugWithChrome"
      }
    }
  ]
}

```

# .vscode/settings.json

```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "editor.codeActionsOnSave": {
    "source.fixAll": "explicit",
    "source.organizeImports": "explicit",
    "source.sortMembers": "explicit"
  },
  "prettier.printWidth": 200
}

```

# app/error.tsx

```tsx
"use client"; // Error components must be Client Components

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </button>
    </div>
  );
}

```

# app/favicon.ico

This is a binary file of the type: Binary

# app/layout.tsx

```tsx
import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";

// Import styles
import "@/app/ui/globals.scss";
import "primereact/resources/primereact.css";
import "primereact/resources/themes/md-dark-deeppurple/theme.css";

// Import components
import { PrimeReactProviders } from "./providers";
import Header from "./ui/Header";

// Configure font
const poppins = Poppins({ 
  subsets: ["latin"], 
  weight: ["400"],
  display: 'swap'
});

// Get base URL dynamically
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  return 'http://localhost:3000';
};

// Metadata configuration
export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: "CryptoBubbles | Interactive visualization using Pixi.js!",
    template: `%s | CryptoBubbles`,
  },
  description: "General info about top 250 cryptocurrencies.",
  icons: {
    icon: '/favicon.ico',
  },
};

// Viewport configuration (separated from metadata)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${poppins.className} bg-zinc-900 text-white min-h-screen`}>
        <Header />
        <main className="mt-2">
          <PrimeReactProviders>{children}</PrimeReactProviders>
        </main>
      </body>
    </html>
  );
}
```

# app/lib/bubbles.utils.ts

```ts
"use client";
import { Circle, PriceChangePercentage } from "@/types/bubbles.types";
import { NFTCollectionData } from "@/types/nft.types";
import * as PIXI from "pixi.js";
import { PixiUtils } from "./pixi.utils";

export type GenerateCirclesParams = {
  collections: NFTCollectionData[];
  bubbleSort: PriceChangePercentage;
  scalingFactor: number;
};

export const appConfig = {
  width: typeof window !== "undefined" ? window.innerWidth - 16 : 100,
  height: typeof window !== "undefined" ? window.innerHeight * 0.84 : 100,
  speed: 0.005,
  elasticity: 0.005,
  wallDamping: 0.5,
  maxCircleSize: 250,
  minCircleSize: typeof window !== "undefined" ? (window.innerWidth ? (window.innerWidth > 920 ? 30 : 15) : 15) : 15,
};
const { wallDamping, width, height, speed, elasticity, maxCircleSize, minCircleSize } = appConfig;

const changeSizeStep = 2;

export class BubblesUtils {
  static getScalingFactor = (data: NFTCollectionData[], bubbleSort: PriceChangePercentage = PriceChangePercentage.HOUR): number => {
    if (!data || data.length === 0) return 1;
    const max = data.map((item) => Math.abs(item[bubbleSort] || 0));
    let totalSquare = 0;

    for (let i = 0; i < max.length; i++) {
      const area = Math.PI * max[i] * max[i];
      totalSquare += area;
    }

    return Math.sqrt((width * height) / totalSquare) * (width > 920 ? 0.8 : 0.5);
  };

  static update = (circles: Circle[], imageSprites: PIXI.Sprite[], textSprites: PIXI.Text[], text2Sprites: PIXI.Text[], circleGraphics: PIXI.Sprite[] = []) => {
    return () => {
      for (let i = 0; i < circles.length; i++) {
        const circle = circles[i];
        const circleGraphic = circleGraphics[i];
        const imageSprite = imageSprites[i];
        const text = textSprites[i];
        const text2 = text2Sprites[i];

        if (!circle || !circleGraphic || !text || !text2) continue;

        const updateCircleChilds = () => {
          circleGraphic.texture = PixiUtils.createGradientTexture(circle.radius * 4, circle.color);

          const fontSize = circle.radius * 0.5;
          const isFullSize = circle.radius * 0.5 < 20;
          const isTextVisible = fontSize >= 20;

          if (imageSprite) {
            imageSprite.width = circle.radius * (isFullSize ? 1.2 : 0.5);
            imageSprite.height = circle.radius * (isFullSize ? 1.2 : 0.5);
            imageSprite.position.set(0, isFullSize ? 0 : -circle.radius / 2);
          }

          const textStyle = new PIXI.TextStyle({
            fontSize: isTextVisible ? `${fontSize}px` : "1px",
            fill: "#ffffff",
          });

          const text2Style = new PIXI.TextStyle({
            fontSize: isTextVisible ? `${fontSize * 0.5}px` : "1px",
            fill: "#ffffff",
          });

          text.style = textStyle;
          text.position.y = 0.15 * circle.radius;

          text2.style = text2Style;
          text2.position.y = circle.radius / 1.5;
        };

        // Update circle position
        circle.x += circle.vx;
        circle.y += circle.vy;

        // Check for collisions with walls
        if (circle.x - circle.radius < 0) {
          circle.x = circle.radius;
          circle.vx *= -1 * (1 - wallDamping);
        } else if (circle.x + circle.radius > width) {
          circle.x = width - circle.radius;
          circle.vx *= -1 * (1 - wallDamping);
        }
        if (circle.y - circle.radius < 0) {
          circle.y = circle.radius;
          circle.vy *= -1 * (1 - wallDamping);
        } else if (circle.y + circle.radius > height) {
          circle.y = height - circle.radius;
          circle.vy *= -1 * (1 - wallDamping);
        }

        // Check for collisions with other circles
        for (let j = i + 1; j < circles.length; j++) {
          const otherCircle = circles[j];
          const dx = otherCircle.x - circle.x;
          const dy = otherCircle.y - circle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < circle.radius + otherCircle.radius) {
            const angle = Math.atan2(dy, dx);
            const totalRadius = circle.radius + otherCircle.radius;
            const overlap = totalRadius - distance;
            const force = overlap * elasticity;

            const dampingFactor = wallDamping;
            circle.vx -= force * Math.cos(angle) * dampingFactor + circle.vx * 0.01;
            circle.vy -= force * Math.sin(angle) * dampingFactor + circle.vy * 0.01;
            otherCircle.vx += force * Math.cos(angle) * dampingFactor;
            otherCircle.vy += force * Math.sin(angle) * dampingFactor;
          }
        }

        // Update container position
        const container = circleGraphic.parent as PIXI.Container;
        if (container) {
          container.position.set(circle.x, circle.y);

          // Smoothly change the size of the circle
          if (circle.radius !== circle.targetRadius) {
            container.cacheAsBitmap = false;
            const sizeDifference = circle.targetRadius - circle.radius;

            if (Math.abs(sizeDifference) <= changeSizeStep) {
              circle.radius = circle.targetRadius;
              container.cacheAsBitmap = true;
            } else {
              circle.radius += sizeDifference > 0 ? changeSizeStep : -changeSizeStep;
              updateCircleChilds();
            }
          }
        }
      }
    };
  };

  static handleEmptySpaceClick = (event: MouseEvent, circles: Circle[]) => {
    const waveForce = 100;
    circles.forEach((circle) => {
      const dx = circle.x - event.clientX;
      const dy = circle.y - event.clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      circle.vx += (waveForce * Math.cos(angle)) / distance;
      circle.vy += (waveForce * Math.sin(angle)) / distance;
    });
  };

  static handleMouseMove = (event: MouseEvent, circles: Circle[]) => {
    const index = circles.findIndex((circle) => circle.dragging);
    if (index !== -1) {
      const circle = circles[index];
      const dx = event.clientX - circle.x;
      const dy = event.clientY - circle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const speed = 3;
      circle.vx = (dx / distance) * speed;
      circle.vy = (dy / distance) * speed;
    }
  };

  static generateCircles = (collections: NFTCollectionData[], scalingFactor: number, bubbleSort: PriceChangePercentage = PriceChangePercentage.HOUR): Circle[] => {
    return collections.map((item) => {
      const value = item[bubbleSort] ?? 0;
      const radius = Math.abs(value * scalingFactor);
      
      // Generate a symbol from the name if none provided
      const displaySymbol = item.symbol || item.name.slice(0, 4).toUpperCase();

      const baseData = {
        id: item.id,
        symbol: displaySymbol,
        image: item.image,
        coinName: item.name,
        x: Math.random() * (width - radius * 2),
        y: Math.random() * (height - radius * 2),
        vx: Math.random() * speed * 2 - speed,
        vy: Math.random() * speed * 2 - speed,
        color: value > 0 ? "green" : "red",
        targetRadius: Math.max(minCircleSize, Math.min(maxCircleSize, radius)),
        radius: minCircleSize,
        dragging: false,
        text2: null as PIXI.Text | null,
        [PriceChangePercentage.HOUR]: item.volume_24h ?? 0,
        [PriceChangePercentage.DAY]: item.volume_7d ?? 0,
        [PriceChangePercentage.WEEK]: item.volume_30d ?? 0,
        [PriceChangePercentage.MONTH]: item.volume_90d ?? 0,
        [PriceChangePercentage.YEAR]: item.collection_score ?? 0,
      };

      return { ...baseData, text2: PixiUtils.createText2(baseData, bubbleSort) };
    });
  };
}
```

# app/lib/image.utils.ts

```ts
// app/lib/image.utils.ts

const DEFAULT_IMAGE = 'https://pbs.twimg.com/media/FNf8P5AVEAEytt-.png';

/**
 * Checks if a URL has a valid image extension
 */
export const hasImageExtension = (url: string): boolean => {
  const imageExtensions = /\.(jpg|jpeg|png|gif|svg|webp)($|\?)/i;
  return imageExtensions.test(url);
};

/**
 * Transforms problematic image URLs into more compatible formats
 */
export const transformImageUrl = (url: string): string => {
  try {
    // Handle Lh3.googleusercontent.com URLs
    if (url.includes('lh3.googleusercontent.com')) {
      return url + '=w500.png';
    }

    // Handle seadn.io URLs without extensions
    if (url.includes('seadn.io') && !hasImageExtension(url)) {
      // Add PNG format if not specified
      return url + (url.includes('?') ? '&format=png' : '?format=png');
    }

    // If URL has a valid image extension, return as is
    if (hasImageExtension(url)) {
      return url;
    }

    // For other URLs without extensions, try to force PNG format
    if (!url.includes('?')) {
      return url + '?format=png';
    }

    return url;
  } catch (error) {
    console.error('Error transforming image URL:', error);
    return DEFAULT_IMAGE;
  }
};

/**
 * Validates if a URL points to a supported image format
 */
export const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};
```

# app/lib/pixi.utils.ts

```ts
'use client';

import { Circle, PriceChangePercentage } from "@/types/bubbles.types";
import dynamic from 'next/dynamic';
import * as PIXI from 'pixi.js';

// Disable PIXI's asset worker when not in browser
if (typeof window === 'undefined') {
  // @ts-ignore
  global.PIXI = { settings: { PREFER_ASSET_WORKER: false } };
}

const gradientTextureCache: Map<string, PIXI.Texture> = new Map();

export class PixiUtils {
  static createContainer = (circle: Circle) => {
    if (typeof window === 'undefined') return null;
    
    const container = new PIXI.Container();
    container.position.set(circle.x, circle.y);
    container.hitArea = new PIXI.Circle(0, 0, circle.radius);
    container.eventMode = "dynamic";
    return container;
  };

  static createImageSprite = (circle: Circle) => {
    if (typeof window === 'undefined') return null;

    const imageSprite = PIXI.Sprite.from(circle.image || 'https://pbs.twimg.com/media/FNf8P5AVEAEytt-.png');
    const isFullSize = circle.radius * 0.3 < 10;

    imageSprite.anchor.set(0.5);
    imageSprite.width = circle.radius * (isFullSize ? 1.2 : 0.5);
    imageSprite.height = circle.radius * (isFullSize ? 1.2 : 0.5);
    imageSprite.position.set(0, isFullSize ? 0 : -circle.radius / 2);

    // Add error handling for image loading
    const texture = imageSprite.texture;
    texture.baseTexture.on('error', () => {
      console.error('Error loading image:', circle.image);
      imageSprite.texture = PIXI.Texture.from('https://pbs.twimg.com/media/FNf8P5AVEAEytt-.png');
    });

    return imageSprite;
  };

  static createText = (circle: Circle) => {
    if (typeof window === 'undefined') return null;

    const fontSize = circle.radius * 0.3;
    const isTextVisible = fontSize > 10;

    const textStyle = new PIXI.TextStyle({
      fontSize: isTextVisible ? fontSize + "px" : "1px",
      fill: "#ffffff",
      wordWrap: true,
      wordWrapWidth: circle.radius * 2,
      align: 'center'
    });

    // Use the collection name instead of symbol
    const text = new PIXI.Text(circle.coinName.slice(0, 20), textStyle);
    text.anchor.set(0.5);
    text.position.y = 0.15 * circle.radius;
    return text;
  };

  static createText2 = (circle: Circle, bubbleSort: PriceChangePercentage) => {
    if (typeof window === 'undefined') return null;

    const fontSize = circle.radius * 0.3;
    const isTextVisible = fontSize > 10;

    const text2Style = new PIXI.TextStyle({
      fontSize: isTextVisible ? fontSize + "px" : "1px",
      fill: "#ffffff",
    });

    const value = circle[bubbleSort];
    const displayValue = typeof value === 'number' 
      ? value.toFixed(2) + '%'
      : 'No data';

    const text2 = new PIXI.Text(displayValue, text2Style);
    text2.anchor.set(0.5);
    text2.position.y = circle.radius / 1.5;
    return text2;
  };


  static createGradientTexture(radius: number, color: string): PIXI.Texture {
    if (typeof window === 'undefined') return PIXI.Texture.EMPTY;

    const textureKey = `${radius}_${color}`;
    if (gradientTextureCache.has(textureKey)) {
      return gradientTextureCache.get(textureKey)!;
    }

    const canvas = document.createElement("canvas");
    canvas.width = radius;
    canvas.height = radius;
    const context = canvas.getContext("2d");

    if (!context) return PIXI.Texture.EMPTY;

    const gradient = context.createRadialGradient(
      radius / 2, radius / 2, 0,
      radius / 2, radius / 2, radius / 2
    );

    switch (color) {
      case "green":
        gradient.addColorStop(0, "rgba(46, 204, 113, 0)");
        gradient.addColorStop(0.42, "rgba(46, 204, 113, 0.15)");
        gradient.addColorStop(0.6, "rgba(46, 204, 113, 0.92)");
        break;
      case "red":
        gradient.addColorStop(0, "rgba(255,99,71, 0.1)");
        gradient.addColorStop(0.45, "rgba(255,99,71, 0.15)");
        gradient.addColorStop(0.6, "rgba(255,99,71, 0.95)");
        break;
    }

    context.fillStyle = gradient;
    context.beginPath();
    context.arc(radius / 2, radius / 2, radius / 2 / 2, 0, Math.PI * 2);
    context.fill();

    const texture = PIXI.Texture.from(canvas);
    gradientTextureCache.set(textureKey, texture);
    return texture;
  }
}
```

# app/lib/utils.ts

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const convertToUSD = (value: number, max: number = 2) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: max,
  }).format(value);
};

```

# app/market-info/page.tsx

```tsx
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
```

# app/opengraph-image.png

This is a binary file of the type: Image

# app/page.tsx

```tsx
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


```

# app/providers.tsx

```tsx
"use client";

import { PrimeReactProvider } from "primereact/api";

interface RootLayoutProps {
  children: React.ReactNode;
}

export function PrimeReactProviders({ children }: RootLayoutProps) {
  return <PrimeReactProvider>{children}</PrimeReactProvider>;
}

```

# app/ui/Bubbles/Bubbles.tsx

```tsx
'use client';

import { PixiUtils } from "@/app/lib/pixi.utils";
import { Circle, PriceChangePercentage } from "@/types/bubbles.types";
import { NFTCollectionData } from "@/types/nft.types";
import gsap from "gsap";
import * as PIXI from "pixi.js";
import React, { useEffect, useMemo, useState } from "react";
import { BubblesUtils, appConfig } from "../../lib/bubbles.utils";
import LoadingBar from "../LoadingBar";
import NavigationBar from "./NavigationBar";
import CollectionDashboard from "./CollectionDashboard";

type Props = {
  collections: NFTCollectionData[];
};

const { width, height, maxCircleSize, minCircleSize } = appConfig;

// Create an image cache to store preloaded images
const imageCache = new Map<string, HTMLImageElement>();

const preloadImage = (url: string): Promise<void> => {
  // If image is already cached, resolve immediately
  if (imageCache.has(url)) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(url, img);
      resolve();
    };
    img.onerror = () => {
      console.warn(`Failed to load image: ${url}, falling back to default`);
      resolve();
    };
    img.src = url;
  });
};

// Preload images in chunks to prevent overwhelming the browser
const preloadImages = async (urls: string[], chunkSize = 10): Promise<void> => {
  for (let i = 0; i < urls.length; i += chunkSize) {
    const chunk = urls.slice(i, i + chunkSize);
    await Promise.all(chunk.map(url => preloadImage(url)));
  }
};

export default function Bubbles({ collections = [] }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [circles, setCircles] = useState<Circle[] | null>(null);
  const [bubbleSort, setBubbleSort] = useState(PriceChangePercentage.HOUR);
  const [selectedCollection, setSelectedCollection] = useState<NFTCollectionData | null>(null);
  const appRef = React.useRef<HTMLDivElement>(null);
  const pixiApp = React.useRef<PIXI.Application | null>(null);

  const scalingFactor = useMemo(() => {
    return BubblesUtils.getScalingFactor(collections, bubbleSort);
  }, [bubbleSort, collections]);

  // Initialize circles and preload images
  useEffect(() => {
    if (collections.length > 0 && typeof window !== 'undefined') {
      const initializeData = async () => {
        try {
          setLoadingProgress(10);
          
          // Extract all image URLs
          const imageUrls = collections.map(collection => collection.image);
          
          // Preload images in chunks
          await preloadImages(imageUrls);
          
          setLoadingProgress(70);
          
          const initialScalingFactor = BubblesUtils.getScalingFactor(collections, PriceChangePercentage.HOUR);
          const shapes = BubblesUtils.generateCircles(collections, initialScalingFactor);
          setCircles(shapes);
          
          setLoadingProgress(80);
        } catch (error) {
          console.error('Error initializing data:', error);
          setIsLoading(false);
        }
      };

      initializeData();
    }
  }, [collections]);

  useEffect(() => {
    if (!circles || !appRef.current || typeof window === 'undefined') return;

    try {
      setLoadingProgress(85);
      const app = new PIXI.Application({
        width,
        height,
        backgroundColor: "#0e1010",
        antialias: true,
      });
      
      pixiApp.current = app;
      appRef.current.appendChild(app.view as unknown as Node);

      const imageSprites: PIXI.Sprite[] = [];
      const textSprites: PIXI.Text[] = [];
      const text2Sprites: PIXI.Text[] = [];
      const circleGraphics: PIXI.Sprite[] = [];

      const handleClick = (e: MouseEvent) => BubblesUtils.handleEmptySpaceClick(e, circles);
      appRef.current.addEventListener("click", handleClick);

      setLoadingProgress(90);

      circles.forEach((circle, index) => {
        const container = PixiUtils.createContainer(circle);
        if (!container) return;

        // Add interactivity to container
        container.eventMode = 'static';
        container.cursor = 'pointer';

        // Add hover effects with GSAP
        container.on('pointerover', () => {
          gsap.to(container.scale, {
            x: 1.1,
            y: 1.1,
            duration: 0.3,
            ease: "power2.out"
          });
        });

        container.on('pointerout', () => {
          gsap.to(container.scale, {
            x: 1,
            y: 1,
            duration: 0.3,
            ease: "power2.out"
          });
        });

        // Add click handler
        container.on('pointertap', () => {
          const collection = collections.find(c => c.id === circle.id);
          if (collection) {
            setSelectedCollection(collection);
          }
        });

        // Create sprite with cached image if available
        const imageSprite = PixiUtils.createImageSprite(circle);
        if (imageSprite) {
          // Start with 0 alpha
          imageSprite.alpha = 0;
          
          // Fade in if image is cached
          if (imageCache.has(circle.image)) {
            gsap.to(imageSprite, {
              alpha: 1,
              duration: 0.3,
              ease: "power2.out"
            });
          }
          
          imageSprites.push(imageSprite);
          container.addChild(imageSprite);
        }

        const circleGraphic = new PIXI.Sprite(PixiUtils.createGradientTexture(circle.radius * 4, circle.color));
        circleGraphic.anchor.set(0.5);
        circleGraphics.push(circleGraphic);
        container.addChild(circleGraphic);

        const text = PixiUtils.createText(circle);
        if (text) {
          textSprites.push(text);
          container.addChild(text);
        }

        const text2 = PixiUtils.createText2(circle, bubbleSort);
        if (text2) {
          text2Sprites.push(text2);
          container.addChild(text2);
        }

        app.stage.addChild(container);
      });

      setLoadingProgress(95);

      const ticker = BubblesUtils.update(circles, imageSprites, textSprites, text2Sprites, circleGraphics);
      
      const timeoutId = setTimeout(() => {
        app.ticker.add(ticker);
        setLoadingProgress(100);
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }, 1000);

      return () => {
        clearTimeout(timeoutId);
        if (pixiApp.current) {
          pixiApp.current.ticker.remove(ticker);
          pixiApp.current.destroy(true);
          pixiApp.current = null;
        }
        if (appRef.current) {
          appRef.current.removeEventListener("click", handleClick);
        }
      };
    } catch (error) {
      console.error('Error initializing PIXI application:', error);
      setIsLoading(false);
    }
  }, [circles, collections, bubbleSort]);

  useEffect(() => {
    if (!circles) return;

    circles.forEach(circle => {
      const value = circle[bubbleSort];
      if (typeof value !== 'number') return;

      const radius = Math.abs(Math.floor(value * scalingFactor));
      circle.targetRadius = Math.max(minCircleSize, Math.min(maxCircleSize, radius));
      circle.color = value > 0 ? "green" : "red";
      
      if (circle.text2 instanceof PIXI.Text) {
        const displayValue = bubbleSort === PriceChangePercentage.YEAR 
          ? value.toFixed(0)
          : value.toLocaleString(undefined, { maximumFractionDigits: 2 });
        circle.text2.text = `${displayValue}%`;
      }
    });
  }, [bubbleSort, scalingFactor]);

  return (
    <div className="flex rounded px-2 overflow-hidden bg-zinc-900 md:flex-col flex-col-reverse">
      <NavigationBar bubbleSort={bubbleSort} setBubbleSort={setBubbleSort} />
      <div 
        style={{ height: "84vh" }} 
        className="bg-zinc-900 w-full overflow-hidden border-2 rounded border-gray-800" 
        ref={appRef}
      />
      <LoadingBar isLoading={isLoading} progress={loadingProgress} />
      <CollectionDashboard
        collection={selectedCollection}
        isOpen={!!selectedCollection}
        onClose={() => setSelectedCollection(null)}
      />
    </div>
  );
}
```

# app/ui/Bubbles/BubblesImpl.tsx

```tsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import * as PIXI from 'pixi.js';
import { PixiUtils } from "@/app/lib/pixi.utils";
import { Circle, PriceChangePercentage } from "@/types/bubbles.types";
import { NFTCollectionData } from "@/types/nft.types";
import { BubblesUtils, appConfig } from "../../lib/bubbles.utils";
import NavigationBar from "./NavigationBar";
import Loader from "../Loader/Loader";
import CollectionDashboard from './CollectionDashboard';
import { transformImageUrl, isValidImageUrl } from '@/app/lib/image.utils';
import gsap from 'gsap';

const { width, height, maxCircleSize, minCircleSize } = appConfig;
const DEFAULT_IMAGE = 'https://pbs.twimg.com/media/FNf8P5AVEAEytt-.png';

interface Props {
  collections: NFTCollectionData[];
  onLoad?: () => void;
}

const preloadImage = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(url);
    img.onerror = () => {
      console.warn(`Failed to load image: ${url}, falling back to default`);
      resolve(DEFAULT_IMAGE);
    };
    img.src = url;
  });
};

const BubblesImpl = ({ collections = [], onLoad }: Props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [circles, setCircles] = useState<Circle[] | null>(null);
  const [bubbleSort, setBubbleSort] = useState(PriceChangePercentage.HOUR);
  const [selectedCollection, setSelectedCollection] = useState<NFTCollectionData | null>(null);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  
  const appRef = React.useRef<HTMLDivElement>(null);
  const pixiApp = React.useRef<PIXI.Application | null>(null);
  const textureCache = React.useRef<Map<string, PIXI.Texture>>(new Map());

  // Pre-load the default image
  useEffect(() => {
    PIXI.Assets.load(DEFAULT_IMAGE).catch(console.error);
  }, []);

  // Calculate scaling factor
  const scalingFactor = useMemo(() => {
    return BubblesUtils.getScalingFactor(collections, bubbleSort);
  }, [bubbleSort, collections]);

  // Initialize circles
  useEffect(() => {
    if (collections.length > 0 && typeof window !== 'undefined') {
      const initialScalingFactor = BubblesUtils.getScalingFactor(collections, PriceChangePercentage.HOUR);
      const shapes = BubblesUtils.generateCircles(collections, initialScalingFactor);
      setCircles(shapes);
    }
  }, [collections]);

  // Setup PIXI application
  useEffect(() => {
    if (!circles || !appRef.current || typeof window === 'undefined') return;

    const app = new PIXI.Application({
      width,
      height,
      backgroundColor: "#0e1010",
      antialias: true,
    });

    pixiApp.current = app;
    appRef.current.appendChild(app.view as unknown as Node);

    const setupCircles = async () => {
      const imageSprites: PIXI.Sprite[] = [];
      const textSprites: PIXI.Text[] = [];
      const text2Sprites: PIXI.Text[] = [];
      const circleGraphics: PIXI.Sprite[] = [];

      // Create glow filter for hover effect
      const glowFilter = new PIXI.BlurFilter();
      glowFilter.blur = 0;
      glowFilter.quality = 4;
    
      // Load all images first using HTML Image element
      const loadedImageUrls = await Promise.all(
        circles.map(circle => preloadImage(circle.image))
      );
    
      // Now create PIXI containers with successfully loaded images
      circles.forEach((circle, index) => {
        const container = new PIXI.Container();
        container.position.set(circle.x, circle.y);
        
        container.eventMode = 'static';
        container.cursor = 'pointer';

        // Add hover effects
        container.on('pointerover', () => {
          // Add glow effect
          container.filters = [glowFilter];
          gsap.to(glowFilter, {
            blur: 15,
            duration: 0.2,
          });
          
          // Scale up effect
          gsap.to(container.scale, {
            x: 1.1,
            y: 1.1,
            duration: 0.2,
          });

          // Add slight alpha effect to text
          if (text) text.alpha = 0.8;
          if (text2) text2.alpha = 0.8;
        });

        container.on('pointerout', () => {
          // Remove glow effect
          gsap.to(glowFilter, {
            blur: 0,
            duration: 0.2,
            onComplete: () => {
              container.filters = null;
            },
          });
          
          // Scale back to normal
          gsap.to(container.scale, {
            x: 1,
            y: 1,
            duration: 0.2,
          });

          // Reset text alpha
          if (text) text.alpha = 1;
          if (text2) text2.alpha = 1;
        });
        
        container.on('pointerdown', () => {
          const collection = collections.find(c => c.id === circle.id);
          if (collection) {
            setSelectedCollection(collection);
            setIsDashboardOpen(true);
          }
        });
    
        // Create sprite from preloaded image
        const imageUrl = loadedImageUrls[index];
        const sprite = PIXI.Sprite.from(imageUrl);
        sprite.anchor.set(0.5);
        
        const isFullSize = circle.radius * 0.3 < 10;
        sprite.width = circle.radius * (isFullSize ? 1.2 : 0.5);
        sprite.height = circle.radius * (isFullSize ? 1.2 : 0.5);
        sprite.position.set(0, isFullSize ? 0 : -circle.radius / 2);
        sprite.eventMode = 'none';
        
        imageSprites.push(sprite);
        container.addChild(sprite);
    
        // Add circle background with glow capability
        const circleGraphic = new PIXI.Sprite(PixiUtils.createGradientTexture(circle.radius * 4, circle.color));
        circleGraphic.anchor.set(0.5);
        circleGraphic.eventMode = 'none';
        
        circleGraphics.push(circleGraphic);
        container.addChild(circleGraphic);
    
        // Add texts
        const text = PixiUtils.createText(circle);
        if (text) {
          text.eventMode = 'none';
          textSprites.push(text);
          container.addChild(text);
        }
    
        const text2 = PixiUtils.createText2(circle, bubbleSort);
        if (text2) {
          text2.eventMode = 'none';
          text2Sprites.push(text2);
          container.addChild(text2);
        }
    
        container.hitArea = new PIXI.Circle(0, 0, circle.radius);
        app.stage.addChild(container);
      });
    
      // Set up ticker after all circles are loaded
      const ticker = BubblesUtils.update(circles, imageSprites, textSprites, text2Sprites, circleGraphics);
      app.ticker.add(ticker);
      setIsLoading(false);
    };

    setupCircles();

    const handleClick = (e: MouseEvent) => BubblesUtils.handleEmptySpaceClick(e, circles);
    appRef.current.addEventListener("click", handleClick);

    return () => {
      if (pixiApp.current) {
        pixiApp.current.destroy(true);
        pixiApp.current = null;
      }
      if (appRef.current) {
        appRef.current.removeEventListener("click", handleClick);
      }
    };
  }, [circles, bubbleSort, collections]);

  // Update bubble properties when sort changes
  useEffect(() => {
    if (!circles) return;

    circles.forEach(circle => {
      const value = circle[bubbleSort];
      if (typeof value !== 'number') return;

      const radius = Math.abs(Math.floor(value)) * scalingFactor;
      circle.targetRadius = Math.max(minCircleSize, Math.min(maxCircleSize, radius));
      circle.color = value > 0 ? "green" : "red";
      
      if (circle.text2 instanceof PIXI.Text) {
        circle.text2.text = `${value.toFixed(2)}%`;
      }
    });
  }, [bubbleSort, scalingFactor, circles]);

  return (
    <div className="flex rounded px-2 overflow-hidden bg-zinc-900 md:flex-col flex-col-reverse">
      <NavigationBar bubbleSort={bubbleSort} setBubbleSort={setBubbleSort} />
      <div 
        style={{ height: "84vh" }} 
        className="bg-zinc-900 w-full overflow-hidden border-2 rounded border-gray-800" 
        ref={appRef}
      />
      {isLoading && <Loader />}
      <CollectionDashboard
        collection={selectedCollection}
        isOpen={isDashboardOpen}
        onClose={() => {
          setIsDashboardOpen(false);
          setSelectedCollection(null);
        }}
      />
    </div>
  );
};

export default BubblesImpl;
```

# app/ui/Bubbles/ClientBubbles.tsx

```tsx
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
```

# app/ui/Bubbles/CollectionDashboard.tsx

```tsx
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
```

# app/ui/Bubbles/index.tsx

```tsx
"use client";

import Bubbles from "./Bubbles";

export default function BubblesPage({ coins }: any) {
  return <Bubbles coins={coins} />;
}

```

# app/ui/Bubbles/NavigationBar.tsx

```tsx
import { PriceChangePercentage } from "@/types/bubbles.types";
import clsx from "clsx";
import React from "react";

type Props = {
  bubbleSort: PriceChangePercentage;
  setBubbleSort: React.Dispatch<React.SetStateAction<PriceChangePercentage>>;
};

export default function NavigationBar({ bubbleSort, setBubbleSort }: Props) {
  const items = [
    { label: "hour", sortValue: PriceChangePercentage.HOUR },
    { label: "day", sortValue: PriceChangePercentage.DAY },
    { label: "week", sortValue: PriceChangePercentage.WEEK },
    { label: "month", sortValue: PriceChangePercentage.MONTH },
    { label: "year", sortValue: PriceChangePercentage.YEAR },
  ];
  return (
    <ul className="flex gap-1  w-full pt-1   md:py-2 fixed w-full bottom-0 left-0 md:static bg-zinc-950 md:bg-transparent">
      {items.map((item, index) => {
        return (
          <li
            className={clsx(
              "p-2 text-center bg-zinc-800 cursor-pointer text-white hover:border-lime-500 hover:border-b-2 ronded-t-lg w-1/5 md:w-auto",
              item.sortValue === bubbleSort && "border-b-2 border-lime-500"
            )}
            key={Math.random()}
            onClick={() => setBubbleSort(item.sortValue)}
          >
            <span className="font-bold">{item.label.toUpperCase()}</span>
          </li>
        );
      })}
    </ul>
  );
}

```

# app/ui/globals.scss

```scss
@tailwind base;
@tailwind components;
@tailwind utilities;

/* primereact */

#coins-table {
  overflow: hidden;
  margin: 0 auto;
  max-width: 1680px;
}

#coins-table .p-datatable .p-datatable-tbody > tr > td {
  padding: 0 0.5rem;
  border-top: 1px solid var(--surface-border);
  height: 6rem;
}

#coins-table .p-progressbar {
  display: block;
  height: 1.5rem;
  border-radius: var(--border-radius);
}

#coins-table .p-progressbar .p-progressbar-value {
  background: rgba(46, 204, 113, 0.5);
}

.p-progressbar .p-progressbar-label {
  line-height: 1.5rem !important;
}

#coins-table .p-progressbar-determinate .p-progressbar-value {
  overflow: visible;
}

#coins-table .p-datatable .p-datatable-tbody > tr {
  &:hover {
    cursor: pointer;
    border-radius: 0.5rem;
  }
}

#coins-table .p-datatable-scrollable .p-frozen-column {
  z-index: 100;
  border-right: 1px solid var(--surface-border);
  max-width: 12rem;
}

@media (max-width: 776px) {
  html {
    font-size: 12px;
  }
}

```

# app/ui/Header.tsx

```tsx
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
```

# app/ui/Loader/Loader.scss

```scss
.loading-spinner {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
}

.loading-spinner-content {
  background-color: rgb(24, 24, 27);
  padding: 4rem;
  border-radius: 0.5rem;
  box-shadow: 0 0 2rem rgba(0, 0, 0, 0.3);
  text-align: center;
  width: 22rem;
  height: 22rem;
}

```

# app/ui/Loader/Loader.tsx

```tsx
import clsx from "clsx";
import Image from "next/image";
import "./Loader.scss";

export default function Loader() {
  return (
    <div className="loading-spinner" data-testid="loading-spinner">
      <div className={clsx("loading-spinner-content", "border rounded border-zinc-800")}>
        <h3 className="text-2xl">Loading data</h3>
        <p>It can take some time to first load..</p>
        <div className="w-full flex justify-center items-center mt-8 animate-bounce ">
          <Image src={"/logo.png"} alt={"logo"} width={100} height={100} />
        </div>
      </div>
    </div>
  );
}

```

# app/ui/LoadingBar/index.tsx

```tsx
'use client';

import React, { useEffect, useState } from 'react';

interface LoadingBarProps {
    isLoading: boolean;
    progress?: number;
  }

  const LoadingBar: React.FC<LoadingBarProps> = ({ isLoading, progress = 0 }) => {
    const [localProgress, setLocalProgress] = useState(0);
  const [showSlowLoadingAlert, setShowSlowLoadingAlert] = useState(false);

  useEffect(() => {
    if (isLoading) {
      const timer1 = setTimeout(() => setLocalProgress(30), 500);
      const timer2 = setTimeout(() => setLocalProgress(60), 1500);
      const timer3 = setTimeout(() => setShowSlowLoadingAlert(true), 5000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else {
      setLocalProgress(100);
      setShowSlowLoadingAlert(false);
    }
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-zinc-900 p-8 rounded-lg max-w-md w-full mx-4 border border-zinc-700">
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2 text-white">
              Loading NFT Collections
            </h3>
            <div className="w-full bg-zinc-700 rounded-full h-2 mb-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress || localProgress}%` }}
              />
            </div>
            <p className="text-sm text-zinc-400 mt-2">
              Fetching collection data...
            </p>
          </div>

          {showSlowLoadingAlert && (
            <div className="bg-red-900/20 border border-red-900 text-red-300 px-4 py-3 rounded relative">
              <strong className="font-bold">Hold on tight!</strong>
              <p className="text-sm mt-1">
                The loading is slow because we are loading images/data of multiple NFTs. I'll fix it soon!
              </p>
            </div>
          )}

          <div className="flex justify-center">

          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingBar;
```

# app/ui/MarketInfo/Chart.tsx

```tsx
"use client";

import clsx from "clsx";
import { UTCTimestamp, createChart } from "lightweight-charts";
import { useEffect, useRef } from "react";

type Props = {
  data: { time: UTCTimestamp; value: number }[];
};

const chartProps = {
  width: 300,
  height: 60,
  layout: {
    textColor: "white",
    background: {
      color: "transparent",
    },
  },
  timeScale: {
    visible: false,
  },
  grid: {
    vertLines: {
      color: "transparent",
    },
    horzLines: {
      color: "transparent",
    },
  },
  crosshair: {
    vertLine: { visible: false },
    horzLine: { visible: false },
  },

  leftPriceScale: {
    visible: false,
  },
  rightPriceScale: {
    visible: false,
  },
  handleScroll: false,
  handleScale: false,
};

export default function Chart({ data }: Props) {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const chart = createChart(chartContainerRef.current!, chartProps);

    chart.timeScale().fitContent();

    const newSeries = chart.addAreaSeries({
      baseLineVisible: false,
      priceLineVisible: false,
      topColor: "gray",
      bottomColor: "rgba(46, 204, 113, 0.1)",
    });
    newSeries.setData(data);

    return () => {
      chart.remove();
    };
  }, [data]);

  return (
    <div className="w-[300px] h-[60px] relative pb-2">
      <div ref={chartContainerRef} className={clsx(!chartContainerRef.current && "invisible")} />
      {!chartContainerRef.current && (
        <div className="max-w-sm animate-pulse absolute bottom-0">
          <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 w-[300px] mb-2.5"></div>
          <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 w-[300px] mb-2.5"></div>
          <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 w-[300px] mb-2.5"></div>
          <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 w-[300px]"></div>
        </div>
      )}
    </div>
  );
}

```

# app/ui/MarketInfo/CoinName.tsx

```tsx
import { CoingeckoCoinData } from "@/types/coingecko.type";
import Image from "next/image";

type Props = {
  coin: CoingeckoCoinData;
};

export default function CoinName({ coin }: Props) {
  return (
    <div className="flex gap-2 items-center">
      <Image width={48} height={48} src={`/assets/coins/${coin.id}.png`} alt={coin.id} />
      <span className="hidden md:block">{coin.name.slice(0, 12)}</span>
      <span className="uppercase">{coin.symbol}</span>
    </div>
  );
}

```

# app/ui/MarketInfo/index.tsx

```tsx
"use client";

import { convertToUSD } from "@/app/lib/utils";
import { CoingeckoCoinData, SparklineData } from "@/types/coingecko.type";
import CoinName from "./CoinName";
import PriceChangeCell from "./PriceChangeCell";

import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";

import { UTCTimestamp } from "lightweight-charts";
import Chart from "./Chart";
import MemoizedSupplyCell from "./SupplyCell";

type Props = {
  coins: CoingeckoCoinData[];
};

const priceChangeColumns = [
  {
    title: "1h",
    prop: "price_change_percentage_1h_in_currency",
  },
  {
    title: "24h",
    prop: "price_change_percentage_24h_in_currency",
  },
  {
    title: "7d",
    prop: "price_change_percentage_7d_in_currency",
  },
  {
    title: "30d",
    prop: "price_change_percentage_30d_in_currency",
  },
  {
    title: "1y",
    prop: "price_change_percentage_1y_in_currency",
  },
];

function generateChartData(data: SparklineData) {
  return data.price.map((item, index) => {
    return { time: (Date.now() + 60 * 60 * 1000 * index) as UTCTimestamp, value: item };
  });
}

export default function MarketInfo({ coins }: Props) {
  return (
    <div className="bg-zinc-900 px-2">
      <div id="coins-table">
        <DataTable rows={20} scrollable lazy stripedRows loading={!coins.length} value={coins}>
          <Column frozen body={(data) => <CoinName coin={data} />} header="Coin"></Column>
          <Column body={(coin) => convertToUSD(coin.current_price)} header="Price"></Column>
          <Column body={(coin) => convertToUSD(coin.market_cap)} header="Market Cap"></Column>
          <Column body={(coin) => convertToUSD(coin.total_volume)} header="Volume"></Column>
          {priceChangeColumns.map((item) => {
            return <Column className="w-4rem" key={Math.random()} body={(coin) => <PriceChangeCell value={coin[item.prop]} />} header={item.title}></Column>;
          })}
          <Column body={(coin) => <MemoizedSupplyCell data={coin} />} header="Supply"></Column>
          <Column body={(coin: CoingeckoCoinData) => <Chart data={generateChartData(coin.sparkline_in_7d)} />} header="Chart 7d"></Column>
        </DataTable>
      </div>
    </div>
  );
}

```

# app/ui/MarketInfo/PriceChangeCell.tsx

```tsx
type Props = {
  value: string;
};

enum CHART_COLORS {
  GREEN = "rgba(46, 204, 113, 0.5)",
  RED = "rgba(255,99,71, 0.5)",
}

export default function PriceChangeCell({ value }: Props) {
  const color = +value > 0 ? CHART_COLORS.GREEN : CHART_COLORS.RED;

  const toPercentage = (value: number, max: number = 2) => {
    const newValue = Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: 1,
      maximumFractionDigits: max,
    }).format(value / 100);

    return value < 0 ? newValue : "+" + newValue;
  };

  return (
    <div className=" p-2 rounded text-center" style={{ background: color }}>
      {toPercentage(+value)}
    </div>
  );
}

```

# app/ui/MarketInfo/SupplyCell.tsx

```tsx
import React from "react";

import { CoingeckoCoinData } from "@/types/coingecko.type";
import { ProgressBar } from "primereact/progressbar";

type Props = {
  data: CoingeckoCoinData;
};

function SupplyCell({ data }: Props) {
  const { circulating_supply, total_supply } = data;

  const valueTemplate = () => {
    const circulatingSupply = Math.round(circulating_supply);
    const totalSupply = total_supply ? Math.round(total_supply) : "None";

    return (
      <span
        style={{
          color: "white",
          fontSize: "0.75rem",
          position: "absolute",
          top: "0px",
          left: "3rem",
        }}
      >
        {circulatingSupply}/<b>{totalSupply}</b>
      </span>
    );
  };
  return <ProgressBar className="text-center text-xs w-64" value={Math.round((circulating_supply / total_supply) * 100)} displayValueTemplate={valueTemplate}></ProgressBar>;
}

const MemoizedSupplyCell = React.memo(SupplyCell);
export default MemoizedSupplyCell;

```

# app/ui/NavigationBar.tsx

```tsx
"use client";

import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavigationBar() {
  const pathname = usePathname();
  const isBubblesViewActive = pathname === "/";
  const isTableViewActive = pathname === "/market-info";

  return (
    <ul className="flex gap-2 text-xs">
      <li>
        <Link
          href={"/"}
          className={clsx(
            "gap-1 p-1 border-b-2  flex items-center flex-col text-center bg-zinc-800 cursor-pointer text-white hover:border-lime-500",
            isBubblesViewActive ? "border-lime-500" : "border-zinc-800"
          )}
        >
          <Image width={20} height={20} src={"/bubbles.png"} alt="bubbles-page-icon" />
          <span className="font-bold ">Bubbles view</span>
        </Link>
      </li>
      <li>
        <Link
          href={"/market-info"}
          className={clsx(
            "gap-1 p-1 border-b-2 border-zinc-800 flex items-center flex-col text-center bg-zinc-800 cursor-pointer text-white hover:border-lime-500",
            isTableViewActive ? "border-lime-500" : "border-zinc-800"
          )}
        >
          <Image width={20} height={20} src={"/table.gif"} alt="bubbles-page-icon" />
          <span className="font-bold ">Table view</span>
        </Link>
      </li>
    </ul>
  );
}

```

# app/ui/NFTTable/index.tsx

```tsx
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
```

# next-env.d.ts

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.

```

# next.config.mjs

```mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // PIXI.js config
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Ignore PIXI.js Worker errors during SSR
    if (isServer) {
      config.module.rules.push({
        test: /\.(mjs|js|ts|tsx)$/,
        exclude: /node_modules(?!\/\@pixi)/,
        loader: 'string-replace-loader',
        options: {
          search: 'new Worker',
          replace: '// new Worker',
        },
      });
    }

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'collection.mooar.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.seadn.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'openseauserdata.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        port: '',
        pathname: '/**',
      }
    ],
    domains: [
      'collection.mooar.com',
      'pbs.twimg.com',
      'i.seadn.io',
      'openseauserdata.com',
      'nftstorage.link',
      'arweave.net',
      'creator-hub-prod.s3.us-east-2.amazonaws.com'
    ]
  },
  // Optimize output
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;  
```

# package.json

```json
{
  "name": "crypto-next",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "clean": "rm -rf .next node_modules",
    "dev:clean": "npm run clean && npm install && npm run dev"
  },
  "dependencies": {
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "gsap": "^3.12.7",
    "lightweight-charts": "^4.1.3",
    "lucide-react": "^0.315.0",
    "next": "14.1.0",
    "pixi.js": "^7.3.3",
    "primereact": "^10.5.1",
    "react": "^18",
    "react-dom": "^18",
    "recharts": "^2.15.0",
    "sass": "^1.70.0",
    "tailwind-merge": "^2.2.1",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "eslint": "^8",
    "eslint-config-next": "14.1.0",
    "postcss": "^8",
    "string-replace-loader": "^3.1.0",
    "tailwindcss": "^3.3.0",
    "typescript": "^5"
  }
}

```

# postcss.config.js

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

```

# public/assets/coins/0x.png

This is a binary file of the type: Image

# public/assets/coins/0x0-ai-ai-smart-contract.png

This is a binary file of the type: Image

# public/assets/coins/1inch.png

This is a binary file of the type: Image

# public/assets/coins/aave.png

This is a binary file of the type: Image

# public/assets/coins/abelian.png

This is a binary file of the type: Image

# public/assets/coins/acala.png

This is a binary file of the type: Image

# public/assets/coins/access-protocol.png

This is a binary file of the type: Image

# public/assets/coins/adventure-gold.png

This is a binary file of the type: Image

# public/assets/coins/aelf.png

This is a binary file of the type: Image

# public/assets/coins/agoras-currency-of-tau.png

This is a binary file of the type: Image

# public/assets/coins/agoric.png

This is a binary file of the type: Image

# public/assets/coins/aioz-network.png

This is a binary file of the type: Image

# public/assets/coins/airtor-protocol.png

This is a binary file of the type: Image

# public/assets/coins/akash-network.png

This is a binary file of the type: Image

# public/assets/coins/alchemix-usd.png

This is a binary file of the type: Image

# public/assets/coins/alchemy-pay.png

This is a binary file of the type: Image

# public/assets/coins/aleph-zero.png

This is a binary file of the type: Image

# public/assets/coins/alephium.png

This is a binary file of the type: Image

# public/assets/coins/alethea-artificial-liquid-intelligence-token.png

This is a binary file of the type: Image

# public/assets/coins/alexgo.png

This is a binary file of the type: Image

# public/assets/coins/algorand.png

This is a binary file of the type: Image

# public/assets/coins/allianceblock-nexera.png

This is a binary file of the type: Image

# public/assets/coins/alpha-finance.png

This is a binary file of the type: Image

# public/assets/coins/altlayer.png

This is a binary file of the type: Image

# public/assets/coins/amp-token.png

This is a binary file of the type: Image

# public/assets/coins/ampleforth.png

This is a binary file of the type: Image

# public/assets/coins/ankr.png

This is a binary file of the type: Image

# public/assets/coins/apecoin.png

This is a binary file of the type: Image

# public/assets/coins/apenft.png

This is a binary file of the type: Image

# public/assets/coins/apex-token-2.png

This is a binary file of the type: Image

# public/assets/coins/api3.png

This is a binary file of the type: Image

# public/assets/coins/aptos.png

This is a binary file of the type: Image

# public/assets/coins/aragon.png

This is a binary file of the type: Image

# public/assets/coins/arbitrum.png

This is a binary file of the type: Image

# public/assets/coins/arcblock.png

This is a binary file of the type: Image

# public/assets/coins/ardor.png

This is a binary file of the type: Image

# public/assets/coins/ark.png

This is a binary file of the type: Image

# public/assets/coins/arkham.png

This is a binary file of the type: Image

# public/assets/coins/arweave.png

This is a binary file of the type: Image

# public/assets/coins/astar.png

This is a binary file of the type: Image

# public/assets/coins/astroport-fi.png

This is a binary file of the type: Image

# public/assets/coins/auction.png

This is a binary file of the type: Image

# public/assets/coins/audius.png

This is a binary file of the type: Image

# public/assets/coins/aurora-near.png

This is a binary file of the type: Image

# public/assets/coins/autonolas.png

This is a binary file of the type: Image

# public/assets/coins/avalanche-2.png

This is a binary file of the type: Image

# public/assets/coins/axelar.png

This is a binary file of the type: Image

# public/assets/coins/axie-infinity.png

This is a binary file of the type: Image

# public/assets/coins/baby-doge-coin.png

This is a binary file of the type: Image

# public/assets/coins/badger-dao.png

This is a binary file of the type: Image

# public/assets/coins/bakerytoken.png

This is a binary file of the type: Image

# public/assets/coins/balancer.png

This is a binary file of the type: Image

# public/assets/coins/bancor.png

This is a binary file of the type: Image

# public/assets/coins/band-protocol.png

This is a binary file of the type: Image

# public/assets/coins/basic-attention-token.png

This is a binary file of the type: Image

# public/assets/coins/beam-2.png

This is a binary file of the type: Image

# public/assets/coins/beldex.png

This is a binary file of the type: Image

# public/assets/coins/benqi-liquid-staked-avax.png

This is a binary file of the type: Image

# public/assets/coins/benqi.png

This is a binary file of the type: Image

# public/assets/coins/biconomy.png

This is a binary file of the type: Image

# public/assets/coins/bifrost.png

This is a binary file of the type: Image

# public/assets/coins/big-time.png

This is a binary file of the type: Image

# public/assets/coins/binance-usd.png

This is a binary file of the type: Image

# public/assets/coins/binancecoin.png

This is a binary file of the type: Image

# public/assets/coins/bitcoin-avalanche-bridged-btc-b.png

This is a binary file of the type: Image

# public/assets/coins/bitcoin-cash-sv.png

This is a binary file of the type: Image

# public/assets/coins/bitcoin-cash.png

This is a binary file of the type: Image

# public/assets/coins/bitcoin-gold.png

This is a binary file of the type: Image

# public/assets/coins/bitcoin.png

This is a binary file of the type: Image

# public/assets/coins/bitget-token.png

This is a binary file of the type: Image

# public/assets/coins/bitkub-coin.png

This is a binary file of the type: Image

# public/assets/coins/bittensor.png

This is a binary file of the type: Image

# public/assets/coins/bittorrent.png

This is a binary file of the type: Image

# public/assets/coins/blockstack.png

This is a binary file of the type: Image

# public/assets/coins/blox.png

This is a binary file of the type: Image

# public/assets/coins/blur.png

This is a binary file of the type: Image

# public/assets/coins/bluzelle.png

This is a binary file of the type: Image

# public/assets/coins/boba-network.png

This is a binary file of the type: Image

# public/assets/coins/bone-shibaswap.png

This is a binary file of the type: Image

# public/assets/coins/bonk.png

This is a binary file of the type: Image

# public/assets/coins/bora.png

This is a binary file of the type: Image

# public/assets/coins/btse-token.png

This is a binary file of the type: Image

# public/assets/coins/canto.png

This is a binary file of the type: Image

# public/assets/coins/cardano.png

This is a binary file of the type: Image

# public/assets/coins/cartesi.png

This is a binary file of the type: Image

# public/assets/coins/casper-network.png

This is a binary file of the type: Image

# public/assets/coins/cdai.png

This is a binary file of the type: Image

# public/assets/coins/celer-network.png

This is a binary file of the type: Image

# public/assets/coins/celestia.png

This is a binary file of the type: Image

# public/assets/coins/celo.png

This is a binary file of the type: Image

# public/assets/coins/celsius-degree-token.png

This is a binary file of the type: Image

# public/assets/coins/centrifuge.png

This is a binary file of the type: Image

# public/assets/coins/certik.png

This is a binary file of the type: Image

# public/assets/coins/chainflip.png

This is a binary file of the type: Image

# public/assets/coins/chaingpt.png

This is a binary file of the type: Image

# public/assets/coins/chainlink.png

This is a binary file of the type: Image

# public/assets/coins/cheelee.png

This is a binary file of the type: Image

# public/assets/coins/chex-token.png

This is a binary file of the type: Image

# public/assets/coins/chia.png

This is a binary file of the type: Image

# public/assets/coins/chiliz.png

This is a binary file of the type: Image

# public/assets/coins/chromaway.png

This is a binary file of the type: Image

# public/assets/coins/civic.png

This is a binary file of the type: Image

# public/assets/coins/coin98.png

This is a binary file of the type: Image

# public/assets/coins/coinbase-wrapped-staked-eth.png

This is a binary file of the type: Image

# public/assets/coins/coinex-token.png

This is a binary file of the type: Image

# public/assets/coins/commune-ai.png

This is a binary file of the type: Image

# public/assets/coins/compound-ether.png

This is a binary file of the type: Image

# public/assets/coins/compound-governance-token.png

This is a binary file of the type: Image

# public/assets/coins/compound-usd-coin.png

This is a binary file of the type: Image

# public/assets/coins/compound-wrapped-btc.png

This is a binary file of the type: Image

# public/assets/coins/conflux-token.png

This is a binary file of the type: Image

# public/assets/coins/constellation-labs.png

This is a binary file of the type: Image

# public/assets/coins/constitutiondao.png

This is a binary file of the type: Image

# public/assets/coins/convex-finance.png

This is a binary file of the type: Image

# public/assets/coins/coq-inu.png

This is a binary file of the type: Image

# public/assets/coins/coredaoorg.png

This is a binary file of the type: Image

# public/assets/coins/corgiai.png

This is a binary file of the type: Image

# public/assets/coins/cortex.png

This is a binary file of the type: Image

# public/assets/coins/cosmos.png

This is a binary file of the type: Image

# public/assets/coins/coti.png

This is a binary file of the type: Image

# public/assets/coins/covalent.png

This is a binary file of the type: Image

# public/assets/coins/cow-protocol.png

This is a binary file of the type: Image

# public/assets/coins/creditcoin-2.png

This is a binary file of the type: Image

# public/assets/coins/crown-by-third-time-games.png

This is a binary file of the type: Image

# public/assets/coins/crvusd.png

This is a binary file of the type: Image

# public/assets/coins/crypto-com-chain.png

This is a binary file of the type: Image

# public/assets/coins/cudos.png

This is a binary file of the type: Image

# public/assets/coins/curve-dao-token.png

This is a binary file of the type: Image

# public/assets/coins/cyberconnect.png

This is a binary file of the type: Image

# public/assets/coins/dai.png

This is a binary file of the type: Image

# public/assets/coins/dao-maker.png

This is a binary file of the type: Image

# public/assets/coins/dash.png

This is a binary file of the type: Image

# public/assets/coins/decentraland.png

This is a binary file of the type: Image

# public/assets/coins/decred.png

This is a binary file of the type: Image

# public/assets/coins/dent.png

This is a binary file of the type: Image

# public/assets/coins/deso.png

This is a binary file of the type: Image

# public/assets/coins/dexe.png

This is a binary file of the type: Image

# public/assets/coins/dextools.png

This is a binary file of the type: Image

# public/assets/coins/digibyte.png

This is a binary file of the type: Image

# public/assets/coins/dimo.png

This is a binary file of the type: Image

# public/assets/coins/dkargo.png

This is a binary file of the type: Image

# public/assets/coins/dodo.png

This is a binary file of the type: Image

# public/assets/coins/dogecoin.png

This is a binary file of the type: Image

# public/assets/coins/dogelon-mars.png

This is a binary file of the type: Image

# public/assets/coins/dogwifcoin.png

This is a binary file of the type: Image

# public/assets/coins/dora-factory-2.png

This is a binary file of the type: Image

# public/assets/coins/dusk-network.png

This is a binary file of the type: Image

# public/assets/coins/dydx-chain.png

This is a binary file of the type: Image

# public/assets/coins/dydx.png

This is a binary file of the type: Image

# public/assets/coins/dymension.png

This is a binary file of the type: Image

# public/assets/coins/ecash.png

This is a binary file of the type: Image

# public/assets/coins/echelon-prime.png

This is a binary file of the type: Image

# public/assets/coins/ecomi.png

This is a binary file of the type: Image

# public/assets/coins/edu-coin.png

This is a binary file of the type: Image

# public/assets/coins/elastos.png

This is a binary file of the type: Image

# public/assets/coins/elrond-erd-2.png

This is a binary file of the type: Image

# public/assets/coins/energy-web-token.png

This is a binary file of the type: Image

# public/assets/coins/enjincoin.png

This is a binary file of the type: Image

# public/assets/coins/eos.png

This is a binary file of the type: Image

# public/assets/coins/ergo.png

This is a binary file of the type: Image

# public/assets/coins/ethena-usde.png

This is a binary file of the type: Image

# public/assets/coins/ethereum-classic.png

This is a binary file of the type: Image

# public/assets/coins/ethereum-name-service.png

This is a binary file of the type: Image

# public/assets/coins/ethereum-pow-iou.png

This is a binary file of the type: Image

# public/assets/coins/ethereum.png

This is a binary file of the type: Image

# public/assets/coins/euler.png

This is a binary file of the type: Image

# public/assets/coins/everipedia.png

This is a binary file of the type: Image

# public/assets/coins/everscale.png

This is a binary file of the type: Image

# public/assets/coins/fantom.png

This is a binary file of the type: Image

# public/assets/coins/fasttoken.png

This is a binary file of the type: Image

# public/assets/coins/fetch-ai.png

This is a binary file of the type: Image

# public/assets/coins/filecoin.png

This is a binary file of the type: Image

# public/assets/coins/first-digital-usd.png

This is a binary file of the type: Image

# public/assets/coins/flare-networks.png

This is a binary file of the type: Image

# public/assets/coins/floki.png

This is a binary file of the type: Image

# public/assets/coins/flow.png

This is a binary file of the type: Image

# public/assets/coins/frax-ether.png

This is a binary file of the type: Image

# public/assets/coins/frax-share.png

This is a binary file of the type: Image

# public/assets/coins/frax.png

This is a binary file of the type: Image

# public/assets/coins/fx-coin.png

This is a binary file of the type: Image

# public/assets/coins/gains-network.png

This is a binary file of the type: Image

# public/assets/coins/gala.png

This is a binary file of the type: Image

# public/assets/coins/gamefi.png

This is a binary file of the type: Image

# public/assets/coins/gas.png

This is a binary file of the type: Image

# public/assets/coins/gatechain-token.png

This is a binary file of the type: Image

# public/assets/coins/gelato.png

This is a binary file of the type: Image

# public/assets/coins/genesysgo-shadow.png

This is a binary file of the type: Image

# public/assets/coins/gitcoin.png

This is a binary file of the type: Image

# public/assets/coins/gmt-token.png

This is a binary file of the type: Image

# public/assets/coins/gmx.png

This is a binary file of the type: Image

# public/assets/coins/gnosis.png

This is a binary file of the type: Image

# public/assets/coins/gods-unchained.png

This is a binary file of the type: Image

# public/assets/coins/goldfinch.png

This is a binary file of the type: Image

# public/assets/coins/golem.png

This is a binary file of the type: Image

# public/assets/coins/guild-of-guardians.png

This is a binary file of the type: Image

# public/assets/coins/guildfi.png

This is a binary file of the type: Image

# public/assets/coins/gxchain.png

This is a binary file of the type: Image

# public/assets/coins/harmony.png

This is a binary file of the type: Image

# public/assets/coins/hashflow.png

This is a binary file of the type: Image

# public/assets/coins/havven.png

This is a binary file of the type: Image

# public/assets/coins/hedera-hashgraph.png

This is a binary file of the type: Image

# public/assets/coins/helium-mobile.png

This is a binary file of the type: Image

# public/assets/coins/helium.png

This is a binary file of the type: Image

# public/assets/coins/heroes-of-mavia.png

This is a binary file of the type: Image

# public/assets/coins/hifi-finance.png

This is a binary file of the type: Image

# public/assets/coins/hive.png

This is a binary file of the type: Image

# public/assets/coins/hivemapper.png

This is a binary file of the type: Image

# public/assets/coins/holotoken.png

This is a binary file of the type: Image

# public/assets/coins/hooked-protocol.png

This is a binary file of the type: Image

# public/assets/coins/humanscape.png

This is a binary file of the type: Image

# public/assets/coins/hunt-token.png

This is a binary file of the type: Image

# public/assets/coins/huobi-btc.png

This is a binary file of the type: Image

# public/assets/coins/huobi-token.png

This is a binary file of the type: Image

# public/assets/coins/hydradx.png

This is a binary file of the type: Image

# public/assets/coins/hytopia.png

This is a binary file of the type: Image

# public/assets/coins/icon.png

This is a binary file of the type: Image

# public/assets/coins/iexec-rlc.png

This is a binary file of the type: Image

# public/assets/coins/illuvium.png

This is a binary file of the type: Image

# public/assets/coins/immutable-x.png

This is a binary file of the type: Image

# public/assets/coins/injective-protocol.png

This is a binary file of the type: Image

# public/assets/coins/insure.png

This is a binary file of the type: Image

# public/assets/coins/internet-computer.png

This is a binary file of the type: Image

# public/assets/coins/iostoken.png

This is a binary file of the type: Image

# public/assets/coins/iota.png

This is a binary file of the type: Image

# public/assets/coins/iotex.png

This is a binary file of the type: Image

# public/assets/coins/jasmycoin.png

This is a binary file of the type: Image

# public/assets/coins/jito-governance-token.png

This is a binary file of the type: Image

# public/assets/coins/joe.png

This is a binary file of the type: Image

# public/assets/coins/jupiter-exchange-solana.png

This is a binary file of the type: Image

# public/assets/coins/just.png

This is a binary file of the type: Image

# public/assets/coins/kadena.png

This is a binary file of the type: Image

# public/assets/coins/kaspa.png

This is a binary file of the type: Image

# public/assets/coins/kava.png

This is a binary file of the type: Image

# public/assets/coins/keep-network.png

This is a binary file of the type: Image

# public/assets/coins/kinesis-gold.png

This is a binary file of the type: Image

# public/assets/coins/kinesis-silver.png

This is a binary file of the type: Image

# public/assets/coins/klay-token.png

This is a binary file of the type: Image

# public/assets/coins/krypton-dao.png

This is a binary file of the type: Image

# public/assets/coins/kucoin-shares.png

This is a binary file of the type: Image

# public/assets/coins/kujira.png

This is a binary file of the type: Image

# public/assets/coins/kusama.png

This is a binary file of the type: Image

# public/assets/coins/kyber-network-crystal.png

This is a binary file of the type: Image

# public/assets/coins/lcx.png

This is a binary file of the type: Image

# public/assets/coins/leo-token.png

This is a binary file of the type: Image

# public/assets/coins/lido-dao.png

This is a binary file of the type: Image

# public/assets/coins/lido-staked-sol.png

This is a binary file of the type: Image

# public/assets/coins/link.png

This is a binary file of the type: Image

# public/assets/coins/liquity-usd.png

This is a binary file of the type: Image

# public/assets/coins/liquity.png

This is a binary file of the type: Image

# public/assets/coins/lisk.png

This is a binary file of the type: Image

# public/assets/coins/litecoin.png

This is a binary file of the type: Image

# public/assets/coins/livepeer.png

This is a binary file of the type: Image

# public/assets/coins/looksrare.png

This is a binary file of the type: Image

# public/assets/coins/loom-network-new.png

This is a binary file of the type: Image

# public/assets/coins/loom-network.png

This is a binary file of the type: Image

# public/assets/coins/loopring.png

This is a binary file of the type: Image

# public/assets/coins/lukso-token-2.png

This is a binary file of the type: Image

# public/assets/coins/lukso-token.png

This is a binary file of the type: Image

# public/assets/coins/lyra-finance.png

This is a binary file of the type: Image

# public/assets/coins/maga.png

This is a binary file of the type: Image

# public/assets/coins/magic.png

This is a binary file of the type: Image

# public/assets/coins/maker.png

This is a binary file of the type: Image

# public/assets/coins/manta-network.png

This is a binary file of the type: Image

# public/assets/coins/mantle-staked-ether.png

This is a binary file of the type: Image

# public/assets/coins/mantle.png

This is a binary file of the type: Image

# public/assets/coins/mantra-dao.png

This is a binary file of the type: Image

# public/assets/coins/maple.png

This is a binary file of the type: Image

# public/assets/coins/marblex.png

This is a binary file of the type: Image

# public/assets/coins/marlin.png

This is a binary file of the type: Image

# public/assets/coins/mask-network.png

This is a binary file of the type: Image

# public/assets/coins/mass-vehicle-ledger.png

This is a binary file of the type: Image

# public/assets/coins/matic-network.png

This is a binary file of the type: Image

# public/assets/coins/maverick-protocol.png

This is a binary file of the type: Image

# public/assets/coins/medibloc.png

This is a binary file of the type: Image

# public/assets/coins/memecoin-2.png

This is a binary file of the type: Image

# public/assets/coins/merit-circle.png

This is a binary file of the type: Image

# public/assets/coins/metal.png

This is a binary file of the type: Image

# public/assets/coins/metaplex.png

This is a binary file of the type: Image

# public/assets/coins/metars-genesis.png

This is a binary file of the type: Image

# public/assets/coins/metis-token.png

This is a binary file of the type: Image

# public/assets/coins/milk-alliance.png

This is a binary file of the type: Image

# public/assets/coins/mina-protocol.png

This is a binary file of the type: Image

# public/assets/coins/mobox.png

This is a binary file of the type: Image

# public/assets/coins/monero.png

This is a binary file of the type: Image

# public/assets/coins/moonbeam.png

This is a binary file of the type: Image

# public/assets/coins/moonriver.png

This is a binary file of the type: Image

# public/assets/coins/moviebloc.png

This is a binary file of the type: Image

# public/assets/coins/msol.png

This is a binary file of the type: Image

# public/assets/coins/multibit.png

This is a binary file of the type: Image

# public/assets/coins/mx-token.png

This is a binary file of the type: Image

# public/assets/coins/my-neighbor-alice.png

This is a binary file of the type: Image

# public/assets/coins/myria.png

This is a binary file of the type: Image

# public/assets/coins/myro.png

This is a binary file of the type: Image

# public/assets/coins/nakamoto-games.png

This is a binary file of the type: Image

# public/assets/coins/nano.png

This is a binary file of the type: Image

# public/assets/coins/near.png

This is a binary file of the type: Image

# public/assets/coins/nem.png

This is a binary file of the type: Image

# public/assets/coins/neo.png

This is a binary file of the type: Image

# public/assets/coins/nervos-network.png

This is a binary file of the type: Image

# public/assets/coins/neutron-3.png

This is a binary file of the type: Image

# public/assets/coins/nexo.png

This is a binary file of the type: Image

# public/assets/coins/nkn.png

This is a binary file of the type: Image

# public/assets/coins/noia-network.png

This is a binary file of the type: Image

# public/assets/coins/numeraire.png

This is a binary file of the type: Image

# public/assets/coins/nxm.png

This is a binary file of the type: Image

# public/assets/coins/nym.png

This is a binary file of the type: Image

# public/assets/coins/oasis-network.png

This is a binary file of the type: Image

# public/assets/coins/oasys.png

This is a binary file of the type: Image

# public/assets/coins/ocean-protocol.png

This is a binary file of the type: Image

# public/assets/coins/oec-token.png

This is a binary file of the type: Image

# public/assets/coins/okb.png

This is a binary file of the type: Image

# public/assets/coins/olympus.png

This is a binary file of the type: Image

# public/assets/coins/omisego.png

This is a binary file of the type: Image

# public/assets/coins/ondo-finance.png

This is a binary file of the type: Image

# public/assets/coins/ong.png

This is a binary file of the type: Image

# public/assets/coins/ontology.png

This is a binary file of the type: Image

# public/assets/coins/open-exchange-token.png

This is a binary file of the type: Image

# public/assets/coins/optimism.png

This is a binary file of the type: Image

# public/assets/coins/oraichain-token.png

This is a binary file of the type: Image

# public/assets/coins/orbs.png

This is a binary file of the type: Image

# public/assets/coins/orca.png

This is a binary file of the type: Image

# public/assets/coins/ordinals.png

This is a binary file of the type: Image

# public/assets/coins/origin-ether.png

This is a binary file of the type: Image

# public/assets/coins/origin-protocol.png

This is a binary file of the type: Image

# public/assets/coins/origintrail.png

This is a binary file of the type: Image

# public/assets/coins/osmosis.png

This is a binary file of the type: Image

# public/assets/coins/ozone-chain.png

This is a binary file of the type: Image

# public/assets/coins/paal-ai.png

This is a binary file of the type: Image

# public/assets/coins/paid-network.png

This is a binary file of the type: Image

# public/assets/coins/pancakeswap-token.png

This is a binary file of the type: Image

# public/assets/coins/pandora.png

This is a binary file of the type: Image

# public/assets/coins/pax-gold.png

This is a binary file of the type: Image

# public/assets/coins/paxos-standard.png

This is a binary file of the type: Image

# public/assets/coins/paypal-usd.png

This is a binary file of the type: Image

# public/assets/coins/pendle.png

This is a binary file of the type: Image

# public/assets/coins/pepe.png

This is a binary file of the type: Image

# public/assets/coins/pepefork.png

This is a binary file of the type: Image

# public/assets/coins/perpetual-protocol.png

This is a binary file of the type: Image

# public/assets/coins/persistence.png

This is a binary file of the type: Image

# public/assets/coins/pha.png

This is a binary file of the type: Image

# public/assets/coins/playdapp.png

This is a binary file of the type: Image

# public/assets/coins/pocket-network.png

This is a binary file of the type: Image

# public/assets/coins/polkadot.png

This is a binary file of the type: Image

# public/assets/coins/polkastarter.png

This is a binary file of the type: Image

# public/assets/coins/polygon-ecosystem-token.png

This is a binary file of the type: Image

# public/assets/coins/polymath.png

This is a binary file of the type: Image

# public/assets/coins/polymesh.png

This is a binary file of the type: Image

# public/assets/coins/power-ledger.png

This is a binary file of the type: Image

# public/assets/coins/prisma-mkusd.png

This is a binary file of the type: Image

# public/assets/coins/project-galaxy.png

This is a binary file of the type: Image

# public/assets/coins/prometeus.png

This is a binary file of the type: Image

# public/assets/coins/pundi-x-2.png

This is a binary file of the type: Image

# public/assets/coins/pyth-network.png

This is a binary file of the type: Image

# public/assets/coins/qtum.png

This is a binary file of the type: Image

# public/assets/coins/quant-network.png

This is a binary file of the type: Image

# public/assets/coins/quark-chain.png

This is a binary file of the type: Image

# public/assets/coins/quasar-2.png

This is a binary file of the type: Image

# public/assets/coins/radiant-capital.png

This is a binary file of the type: Image

# public/assets/coins/radicle.png

This is a binary file of the type: Image

# public/assets/coins/radix.png

This is a binary file of the type: Image

# public/assets/coins/ravencoin.png

This is a binary file of the type: Image

# public/assets/coins/raydium.png

This is a binary file of the type: Image

# public/assets/coins/redacted.png

This is a binary file of the type: Image

# public/assets/coins/render-token.png

This is a binary file of the type: Image

# public/assets/coins/request-network.png

This is a binary file of the type: Image

# public/assets/coins/reserve-rights-token.png

This is a binary file of the type: Image

# public/assets/coins/ribbon-finance.png

This is a binary file of the type: Image

# public/assets/coins/rif-token.png

This is a binary file of the type: Image

# public/assets/coins/ripple.png

This is a binary file of the type: Image

# public/assets/coins/rocket-pool-eth.png

This is a binary file of the type: Image

# public/assets/coins/rocket-pool.png

This is a binary file of the type: Image

# public/assets/coins/rollbit-coin.png

This is a binary file of the type: Image

# public/assets/coins/ronin.png

This is a binary file of the type: Image

# public/assets/coins/rss3.png

This is a binary file of the type: Image

# public/assets/coins/safepal.png

This is a binary file of the type: Image

# public/assets/coins/sats-ordinals.png

This is a binary file of the type: Image

# public/assets/coins/saucerswap.png

This is a binary file of the type: Image

# public/assets/coins/secret.png

This is a binary file of the type: Image

# public/assets/coins/seedify-fund.png

This is a binary file of the type: Image

# public/assets/coins/sei-network.png

This is a binary file of the type: Image

# public/assets/coins/shardus.png

This is a binary file of the type: Image

# public/assets/coins/shiba-inu.png

This is a binary file of the type: Image

# public/assets/coins/shido-2.png

This is a binary file of the type: Image

# public/assets/coins/short-term-t-bill-token.png

This is a binary file of the type: Image

# public/assets/coins/shrapnel-2.png

This is a binary file of the type: Image

# public/assets/coins/siacoin.png

This is a binary file of the type: Image

# public/assets/coins/singularitynet.png

This is a binary file of the type: Image

# public/assets/coins/skale.png

This is a binary file of the type: Image

# public/assets/coins/smardex.png

This is a binary file of the type: Image

# public/assets/coins/smooth-love-potion.png

This is a binary file of the type: Image

# public/assets/coins/snek.png

This is a binary file of the type: Image

# public/assets/coins/solana.png

This is a binary file of the type: Image

# public/assets/coins/songbird.png

This is a binary file of the type: Image

# public/assets/coins/sovryn.png

This is a binary file of the type: Image

# public/assets/coins/space-id.png

This is a binary file of the type: Image

# public/assets/coins/spell-token.png

This is a binary file of the type: Image

# public/assets/coins/ssv-network.png

This is a binary file of the type: Image

# public/assets/coins/stader-ethx.png

This is a binary file of the type: Image

# public/assets/coins/stader-maticx.png

This is a binary file of the type: Image

# public/assets/coins/staked-ether.png

This is a binary file of the type: Image

# public/assets/coins/staked-frax-ether.png

This is a binary file of the type: Image

# public/assets/coins/star-atlas-dao.png

This is a binary file of the type: Image

# public/assets/coins/stargate-finance.png

This is a binary file of the type: Image

# public/assets/coins/stargaze.png

This is a binary file of the type: Image

# public/assets/coins/stasis-eurs.png

This is a binary file of the type: Image

# public/assets/coins/status.png

This is a binary file of the type: Image

# public/assets/coins/steem.png

This is a binary file of the type: Image

# public/assets/coins/stellar.png

This is a binary file of the type: Image

# public/assets/coins/stepn.png

This is a binary file of the type: Image

# public/assets/coins/storj.png

This is a binary file of the type: Image

# public/assets/coins/storm.png

This is a binary file of the type: Image

# public/assets/coins/stp-network.png

This is a binary file of the type: Image

# public/assets/coins/stratis.png

This is a binary file of the type: Image

# public/assets/coins/stride.png

This is a binary file of the type: Image

# public/assets/coins/sui.png

This is a binary file of the type: Image

# public/assets/coins/sun-token.png

This is a binary file of the type: Image

# public/assets/coins/superfarm.png

This is a binary file of the type: Image

# public/assets/coins/superrare.png

This is a binary file of the type: Image

# public/assets/coins/sushi.png

This is a binary file of the type: Image

# public/assets/coins/sweatcoin.png

This is a binary file of the type: Image

# public/assets/coins/sweth.png

This is a binary file of the type: Image

# public/assets/coins/swipe.png

This is a binary file of the type: Image

# public/assets/coins/swissborg.png

This is a binary file of the type: Image

# public/assets/coins/synapse-2.png

This is a binary file of the type: Image

# public/assets/coins/syscoin.png

This is a binary file of the type: Image

# public/assets/coins/tbtc.png

This is a binary file of the type: Image

# public/assets/coins/tectum.png

This is a binary file of the type: Image

# public/assets/coins/telcoin.png

This is a binary file of the type: Image

# public/assets/coins/tellor.png

This is a binary file of the type: Image

# public/assets/coins/telos.png

This is a binary file of the type: Image

# public/assets/coins/tenset.png

This is a binary file of the type: Image

# public/assets/coins/terra-luna-2.png

This is a binary file of the type: Image

# public/assets/coins/terra-luna.png

This is a binary file of the type: Image

# public/assets/coins/terrausd.png

This is a binary file of the type: Image

# public/assets/coins/tether-gold.png

This is a binary file of the type: Image

# public/assets/coins/tether.png

This is a binary file of the type: Image

# public/assets/coins/tezos.png

This is a binary file of the type: Image

# public/assets/coins/the-graph.png

This is a binary file of the type: Image

# public/assets/coins/the-open-network.png

This is a binary file of the type: Image

# public/assets/coins/the-sandbox.png

This is a binary file of the type: Image

# public/assets/coins/theta-fuel.png

This is a binary file of the type: Image

# public/assets/coins/theta-token.png

This is a binary file of the type: Image

# public/assets/coins/thorchain.png

This is a binary file of the type: Image

# public/assets/coins/threshold-network-token.png

This is a binary file of the type: Image

# public/assets/coins/tokamak-network.png

This is a binary file of the type: Image

# public/assets/coins/tokenize-xchange.png

This is a binary file of the type: Image

# public/assets/coins/tominet.png

This is a binary file of the type: Image

# public/assets/coins/tomochain.png

This is a binary file of the type: Image

# public/assets/coins/trac.png

This is a binary file of the type: Image

# public/assets/coins/trias-token.png

This is a binary file of the type: Image

# public/assets/coins/tribe-2.png

This is a binary file of the type: Image

# public/assets/coins/tron.png

This is a binary file of the type: Image

# public/assets/coins/true-usd.png

This is a binary file of the type: Image

# public/assets/coins/trust-wallet-token.png

This is a binary file of the type: Image

# public/assets/coins/ultima.png

This is a binary file of the type: Image

# public/assets/coins/uma.png

This is a binary file of the type: Image

# public/assets/coins/uniswap.png

This is a binary file of the type: Image

# public/assets/coins/uquid-coin.png

This is a binary file of the type: Image

# public/assets/coins/usd-coin.png

This is a binary file of the type: Image

# public/assets/coins/usdd.png

This is a binary file of the type: Image

# public/assets/coins/usdx.png

This is a binary file of the type: Image

# public/assets/coins/vanar-chain.png

This is a binary file of the type: Image

# public/assets/coins/vechain.png

This is a binary file of the type: Image

# public/assets/coins/venus.png

This is a binary file of the type: Image

# public/assets/coins/verasity.png

This is a binary file of the type: Image

# public/assets/coins/verus-coin.png

This is a binary file of the type: Image

# public/assets/coins/vethor-token.png

This is a binary file of the type: Image

# public/assets/coins/victoria-vr.png

This is a binary file of the type: Image

# public/assets/coins/vitadao.png

This is a binary file of the type: Image

# public/assets/coins/vulcan-forged.png

This is a binary file of the type: Image

# public/assets/coins/vvs-finance.png

This is a binary file of the type: Image

# public/assets/coins/waves.png

This is a binary file of the type: Image

# public/assets/coins/wax.png

This is a binary file of the type: Image

# public/assets/coins/wazirx.png

This is a binary file of the type: Image

# public/assets/coins/wemix-token.png

This is a binary file of the type: Image

# public/assets/coins/wen-4.png

This is a binary file of the type: Image

# public/assets/coins/wexo.png

This is a binary file of the type: Image

# public/assets/coins/whitebit.png

This is a binary file of the type: Image

# public/assets/coins/wilder-world.png

This is a binary file of the type: Image

# public/assets/coins/wink.png

This is a binary file of the type: Image

# public/assets/coins/woo-network.png

This is a binary file of the type: Image

# public/assets/coins/world-mobile-token.png

This is a binary file of the type: Image

# public/assets/coins/worldcoin-wld.png

This is a binary file of the type: Image

# public/assets/coins/wrapped-beacon-eth.png

This is a binary file of the type: Image

# public/assets/coins/wrapped-bitcoin.png

This is a binary file of the type: Image

# public/assets/coins/wrapped-centrifuge.png

This is a binary file of the type: Image

# public/assets/coins/xai-blockchain.png

This is a binary file of the type: Image

# public/assets/coins/xdce-crowd-sale.png

This is a binary file of the type: Image

# public/assets/coins/xpla.png

This is a binary file of the type: Image

# public/assets/coins/xyo-network.png

This is a binary file of the type: Image

# public/assets/coins/yearn-finance.png

This is a binary file of the type: Image

# public/assets/coins/yield-guild-games.png

This is a binary file of the type: Image

# public/assets/coins/zcash.png

This is a binary file of the type: Image

# public/assets/coins/zelcash.png

This is a binary file of the type: Image

# public/assets/coins/zencash.png

This is a binary file of the type: Image

# public/assets/coins/zephyr-protocol.png

This is a binary file of the type: Image

# public/assets/coins/zetachain.png

This is a binary file of the type: Image

# public/assets/coins/zignaly.png

This is a binary file of the type: Image

# public/assets/coins/zilliqa.png

This is a binary file of the type: Image

# public/assets/coins/zkfair.png

This is a binary file of the type: Image

# public/logo.png

This is a binary file of the type: Image

# public/network/bnb.png

This is a binary file of the type: Image

# public/network/ethereum.png

This is a binary file of the type: Image

# public/network/polygon.png

This is a binary file of the type: Image

# public/network/solana.png

This is a binary file of the type: Image

# public/table.gif

This is a binary file of the type: Image

# README.md

```md
# CryptoBubbles Pixi.js Next.js 14

Сryptobubbles is an application for monitoring cryptocurrency price changes over different periods of time.
The application implemented using Next.js framework with Typescript. For interactive animation I use Pixi.js. Shadcn UI and tailwind for styling.

### Features

- Interactive animation using Pixi.js: text, sprite, texture, gradient, collision.
- Click on an empty space to disperse the balls.
- Ability to switch the period of time to change view or page to load new coins.
- Request data from coingecko API.

## Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository:**

   \`\`\`bash
   git clone https://github.com/andreypotkas/cryptobubbles-next.git
   cd cryptobubbles-next
   \`\`\`

2. **Install dependencies:**

   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. **Run:**

   \`\`\`bash
   npm run dev
   # or
   yarn dev

   \`\`\`

### Configuration

\`\`\`env
COINGECKO_API_SECRET_KEY=
\`\`\`

```

# tailwind.config.ts

```ts
import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
```

# tsconfig.json

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}

```

# types/bubbles.types.ts

```ts
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
```

# types/coingecko.type.ts

```ts
export interface SparklineData {
  price: number[];
}

interface ROI {
  times: number;
  currency: string;
  percentage: number;
}

export interface CoingeckoCoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: ROI | null;
  last_updated: string;
  sparkline_in_7d: SparklineData;
  price_change_percentage_1h_in_currency: number;
  price_change_percentage_1y_in_currency: number;
  price_change_percentage_24h_in_currency: number;
  price_change_percentage_30d_in_currency: number;
  price_change_percentage_7d_in_currency: number;
}

export type CoingeckoHistoryResponse = [number, number, number, number][];

export interface CoingeckoSingleCoinData {
  id: string;
  symbol: string;
  name: string;
  asset_platform_id: string;
  platforms: Record<string, string>;
  detail_platforms: Record<string, { decimal_place: number; contract_address: string }>;
  block_time_in_minutes: number;
  hashing_algorithm: string | null;
  categories: string[];
  preview_listing: boolean;
  public_notice: string | null;
  additional_notices: string[];
  description: Record<string, string>;
  links: {
    homepage: string[];
    blockchain_site: string[];
    official_forum_url: string[];
    chat_url: string[];
    announcement_url: string[];
    twitter_screen_name: string;
    facebook_username: string;
    bitcointalk_thread_identifier: string | null;
    telegram_channel_identifier: string;
    subreddit_url: string | null;
    repos_url: {
      github: string[];
      bitbucket: string[];
    };
  };
  image: {
    thumb: string;
    small: string;
    large: string;
  };
  country_origin: string;
  genesis_date: string | null;
  contract_address: string;
  sentiment_votes_up_percentage: number | null;
  sentiment_votes_down_percentage: number | null;
  watchlist_portfolio_users: number;
  market_cap_rank: number | null;
  coingecko_rank: number;
  coingecko_score: number;
  developer_score: number;
  community_score: number;
  liquidity_score: number;
  public_interest_score: number;
  community_data: {
    facebook_likes: number | null;
    twitter_followers: number;
    reddit_average_posts_48h: number;
    reddit_average_comments_48h: number;
    reddit_subscribers: number;
    reddit_accounts_active_48h: number;
    telegram_channel_user_count: number;
  };
  market_data: MarketData;
  developer_data: {
    forks: number;
    stars: number;
    subscribers: number;
    total_issues: number;
    closed_issues: number;
    pull_requests_merged: number;
    pull_request_contributors: number;
    code_additions_deletions_4_weeks: {
      additions: number | null;
      deletions: number | null;
    };
    commit_count_4_weeks: number;
    last_4_weeks_commit_activity_series: number[];
  };
  public_interest_stats: {
    alexa_rank: number | null;
    bing_matches: number | null;
  };
  status_updates: string[];
  last_updated: string;
  tickers: Ticker[];
}
export interface Ticker {
  base: string;
  target: string;
  market: {
    name: string;
    identifier: string;
    has_trading_incentive: boolean;
  };
  last: number;
  volume: number;
  converted_last: {
    btc: number;
    eth: number;
    usd: number;
  };
  converted_volume: {
    btc: number;
    eth: number;
    usd: number;
  };
  trust_score: string | null;
  bid_ask_spread_percentage: number;
  timestamp: string;
  last_traded_at: string;
  last_fetch_at: string;
  is_anomaly: boolean;
  is_stale: boolean;
  trade_url: string;
  token_info_url: string | null;
  coin_id: string;
  target_coin_id: string;
}
interface MarketData {
  ath: Record<string, number>;
  ath_change_percentage: Record<string, number>;
  ath_date: Record<string, string>;
  atl: Record<string, number>;
  atl_change_percentage: Record<string, number>;
  atl_date: Record<string, string>;
  circulating_supply: number;
  current_price: Record<string, number>;
  fdv_to_tvl_ratio: null;
  fully_diluted_valuation: Record<string, number>;
  high_24h: Record<string, number>;
  last_updated: string;
  low_24h: Record<string, number>;
  market_cap: Record<string, number>;
  market_cap_change_24h: number;
  market_cap_change_24h_in_currency: Record<string, number>;
  market_cap_change_percentage_24h: number;
  market_cap_change_percentage_24h_in_currency: Record<string, number>;
  market_cap_fdv_ratio: number;
  market_cap_rank: number;
  max_supply: number;
  mcap_to_tvl_ratio: null;
  price_change_24h: number;
  price_change_24h_in_currency: Record<string, number>;
  price_change_percentage_1h_in_currency: Record<string, number>;
  price_change_percentage_1y: number;
  price_change_percentage_1y_in_currency: Record<string, number>;
  price_change_percentage_7d: number;
  price_change_percentage_7d_in_currency: Record<string, number>;
  price_change_percentage_14d: number;
  price_change_percentage_14d_in_currency: Record<string, number>;
  price_change_percentage_24h: number;
  price_change_percentage_24h_in_currency: Record<string, number>;
  price_change_percentage_30d: number;
  price_change_percentage_30d_in_currency: Record<string, number>;
  price_change_percentage_60d: number;
  price_change_percentage_60d_in_currency: Record<string, number>;
  price_change_percentage_200d: number;
  price_change_percentage_200d_in_currency: Record<string, number>;
  roi: null;
  total_supply: number;
  total_value_locked: null;
  total_volume: Record<string, number>;
}

```

# types/nft.types.ts

```ts
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
```

