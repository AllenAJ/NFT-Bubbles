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