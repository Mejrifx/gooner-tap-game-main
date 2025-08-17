# Custom Audio Files for Tap Sounds

## Required Files:
- `1.mp3` - Sound for first tap/frame (Gooner image frame 1)
- `2.mp3` - Sound for second tap/frame (Gooner image frame 2)

## File Requirements:
- Format: MP3 (for best browser compatibility)
- Size: Recommended under 1-2MB each
- Quality: Good enough for game sound effects

## Implementation:
- Frame 0 (first tap) plays `1.mp3`
- Frame 1 (second tap) plays `2.mp3`
- Sounds loop as user continues tapping
- Volume is set to 50% but can be adjusted

## To Add Your Files:
1. Place your audio files in this `/public/` directory
2. Name them exactly `1.mp3` and `2.mp3`
3. The app will automatically use them

Current implementation uses the Audio Web API for playback.
