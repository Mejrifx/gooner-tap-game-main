# GOONER TapTap - Penguin Tap-to-Earn Game

A mobile-first Progressive Web App (PWA) inspired by Popcat Solana, themed around the GOONER meme coin with penguin characters.

## 🎮 Features

- **Tap-to-Earn Gameplay**: Tap the penguin to rack up pops
- **Mobile-First Design**: Optimized for touch devices with haptic feedback
- **PWA Support**: Installable on mobile devices, works offline
- **Penguin Animations**: Interactive penguin with mouth opening animation
- **Sound Effects**: Audio feedback using Web Audio API
- **GOONER Integration**: Placeholder for Solana token integration

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📱 PWA Installation

The app can be installed on mobile devices:
1. Open the app in a mobile browser
2. Look for "Add to Home Screen" prompt
3. Install and launch from home screen

## 🎨 Customization

### Adding Real Penguin Images
Replace the CSS-based penguin in `src/components/PenguinTap.tsx` with actual PNG images:

```jsx
// Replace the CSS penguin with:
<img 
  src="/penguin-closed.png" 
  alt="Penguin" 
  className={isPressed ? "hidden" : "block"}
/>
<img 
  src="/penguin-open.png" 
  alt="Penguin Opening Mouth" 
  className={isPressed ? "block" : "hidden"}
/>
```

### Adding Real Sounds
Replace the Web Audio API sound generation with actual audio files:

```jsx
const playSound = () => {
  const audio = new Audio('/squawk.mp3');
  audio.play();
};
```

### Contract Address
Update the contract address in `PenguinTap.tsx`:

```jsx
// Replace placeholder CA
<div className="font-mono text-xs break-all">
  YOUR_ACTUAL_CONTRACT_ADDRESS_HERE
</div>
```

## 🔗 Solana Integration

Uncomment and implement the Solana wallet connection code in `PenguinTap.tsx`:

```bash
# Install Solana dependencies
npm install @solana/web3.js @solana/wallet-adapter-react @solana/wallet-adapter-wallets
```

## 🎯 Deployment

### Vercel Deployment
1. Push to GitHub repository
2. Connect to Vercel
3. Deploy automatically

### Manual Build
```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 🛠️ Tech Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Vite** for building
- **PWA** capabilities with service worker
- **Web Audio API** for sound effects
- **Touch/Mouse Events** for mobile & desktop

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                 # Shadcn UI components
│   └── PenguinTap.tsx     # Main game component
├── pages/
│   └── Index.tsx          # Main page
├── index.css              # Global styles & theme
└── main.tsx               # App entry point

public/
├── manifest.json          # PWA manifest
├── sw.js                  # Service worker
└── favicon.ico           # App icon
```

## 🎨 Theme Colors

The app uses a penguin-inspired color scheme:
- **Primary**: Blue (#3b82f6) for branding
- **Secondary**: Light blue (#0ea5e9) for accents  
- **Background**: Ice blue gradients
- **Dark Mode**: Deep blue with ice highlights

## 📈 Future Enhancements

- [ ] Real penguin artwork and animations
- [ ] Sound effects and background music
- [ ] Solana wallet integration
- [ ] On-chain pop tracking
- [ ] Leaderboards and achievements
- [ ] Multiplayer tap battles
- [ ] NFT penguin collectibles

## 🐧 About GOONER

This game is themed around the GOONER meme coin on Solana. Join the community and tap your way to success!

---

Built with ❄️ by the GOONER community