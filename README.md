# NFT Bubbles Visualization

An interactive visualization tool for NFT collection analytics built with Next.js 14, PIXI.js, and TypeScript.

## Features

- Interactive bubble visualization with physics and collisions
- Real-time NFT collection data display
- Filtering by multiple time periods (24h, 7d, 30d, 90d)
- Detailed collection analytics dashboard
- Responsive design with mobile support
- Table view with sorting and filtering capabilities

## Tech Stack

- Next.js 14
- PIXI.js for animations
- TypeScript
- Tailwind CSS
- Recharts for analytics
- PrimeReact components

## Getting Started

```bash
# Clone repository
git clone https://github.com/yourusername/nft-bubbles.git

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Configuration

Create a `.env` file in the root directory:

```env
NEXT_PUBLIC_API_KEY=your_unleash_nft_api_key
```

## API Integration

This project uses the Unleash NFTs API for data. Required header for all requests:

```
x-api-key: your_api_key
```

## Project Structure

```
/app
  /lib        # Utilities and helpers
  /ui         # React components
  /types      # TypeScript types
/public       # Static assets
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Submit a pull request

## License

MIT