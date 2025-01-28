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

  const currentAppRef = appRef.current;
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