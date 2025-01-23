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

  useEffect(() => {
    if (collections.length > 0 && typeof window !== 'undefined') {
      const initializeData = async () => {
        try {
          setLoadingProgress(10);
          const imageUrls = collections.map(collection => collection.image);
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

    const currentAppRef = appRef.current;
    try {
      setLoadingProgress(85);
      const app = new PIXI.Application({
        width,
        height,
        backgroundColor: "#0e1010",
        antialias: true,
      });
      
      pixiApp.current = app;
      currentAppRef.appendChild(app.view as unknown as Node);

      const imageSprites: PIXI.Sprite[] = [];
      const textSprites: PIXI.Text[] = [];
      const text2Sprites: PIXI.Text[] = [];
      const circleGraphics: PIXI.Sprite[] = [];

      const handleClick = (e: MouseEvent) => BubblesUtils.handleEmptySpaceClick(e, circles);
      currentAppRef.addEventListener("click", handleClick);

      setLoadingProgress(90);

      circles.forEach((circle, index) => {
        const container = PixiUtils.createContainer(circle);
        if (!container) return;

        container.eventMode = 'static';
        container.cursor = 'pointer';

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

        container.on('pointertap', () => {
          const collection = collections.find(c => c.id === circle.id);
          if (collection) {
            setSelectedCollection(collection);
          }
        });

        const imageSprite = PixiUtils.createImageSprite(circle);
        if (imageSprite) {
          imageSprite.alpha = 0;
          
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
        if (currentAppRef) {
          currentAppRef.removeEventListener("click", handleClick);
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
  }, [bubbleSort, scalingFactor, circles]);

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