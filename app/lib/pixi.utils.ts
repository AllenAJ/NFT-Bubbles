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

    // Add the fix here
    const safeRadius = Math.max(1, radius);
    const centerX = safeRadius / 2;
    const centerY = safeRadius / 2;
    const gradient = context.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, centerX
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