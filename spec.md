# CyberMeet - Cybersecurity Client Meeting Platform

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Meeting room interface with a "hacker" / cyberpunk dark terminal aesthetic
- Ability to create and join meeting rooms (by room code)
- In-meeting text chat with real-time message display
- Meeting participants list (who is in the room)
- Meeting scheduling / upcoming meetings list on a dashboard
- Notes panel per meeting (for cybersecurity professionals to jot down session notes)
- User display names and role tags (e.g. "ANALYST", "CONSULTANT", "CLIENT")
- Animated terminal-style UI (green-on-black, matrix-inspired, monospace fonts, scanlines effect)

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Backend: user profiles with display name + role, meeting rooms (create/join/leave), messages per room, meeting notes per room
2. Frontend: dark terminal/hacker aesthetic using Tailwind (green/cyan on black, monospace), landing/login page, dashboard with meetings list, meeting room page with chat + participants + notes sidebar
3. Animate with CSS: scanline overlay, blinking cursors, glitch effects on headers

## UX Notes
- Full dark mode only (black background, neon green/cyan text)
- Monospace font throughout (JetBrains Mono or similar)
- Terminal-style panels with border glows
- Matrix-rain or scanline background effect on key screens
- All buttons styled like CLI commands (e.g. `[> JOIN_ROOM]`)
- Role badges styled like access level tags
- Timestamps on messages in military time
