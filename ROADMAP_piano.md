# Piano Teaching App - Development Roadmap

## Project Overview

A web-based piano learning application for young children that teaches sheet music reading through color-coded notation, interactive composition, and gamified practice sessions.

### Tech Stack
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Utilities:** usehooks-ts
- **Audio:** Tone.js (recommended)
- **State Management:** Zustand or Jotai (recommended)

---

## Core Features (MVP)

### 1. Visual System
- **3-Line Staff System:** Simplified musical staff with 3 lines instead of traditional 5
- **Color-Coded Notes:** Each note position has a unique color matching the piano keys
- **Time-Based Positioning:** All elements positioned using time values, not XY coordinates
- **SVG Rendering:** Clean, scalable vector graphics
- **Export Functionality:** Save current composition as PNG or SVG for printing/books

### 2. Interactive Piano
- **Visual Piano Keyboard:** Color-matched keys (white keys + sharps/black keys)
- **Audio Playback:** Real piano sounds for all keys
- **Keyboard Input:** Map computer keyboard to piano keys
- **Sustain Pedal:** Space bar (or Shift) to simulate foot pedal
- **Visual Feedback:** Key press animations and highlights

### 3. Composition Tools
- **Note Placement:** Click to place notes on staff with automatic grid snapping
- **Drag & Drop:** Move notes around with smooth snapping to time/pitch grid
- **Right-Click Menu:** Change note duration, pitch, delete notes
- **Duration Visualization:** Each note shows a line indicating its length
  - Example: Whole note on 4/4 = 4 beats (note takes 0.5 width, line takes 3.5 width)
- **Repeat Markers:** Place and move repeat symbols that save with the song
- **Tempo Control:** Adjustable BPM slider/input

### 4. Playback System
- **Play Button:** Trigger playback of composed music
- **Playback Cursor:** Animated line moving along staff in perfect sync
- **Note Highlighting:** Halo effect or glow on currently playing notes
- **Repeat Handling:** Proper loop playback based on repeat markers
- **Accurate Timing:** Use tempo + time values for precise scheduling

### 5. Data Persistence
- **LocalStorage:** Save songs locally in browser
- **Song Metadata:** Title, creation date, last modified, tempo, etc.
- **Auto-Save:** Debounced auto-save on changes
- **Song Library UI:** List, load, delete saved compositions
- **Future Online Sync:** Backend preparation for cloud storage

---

## Development Phases

### **Phase 1: Foundation & Setup** (Weeks 1-2)

#### Goals
Set up the project infrastructure and establish core data models

#### Tasks
1. **Project Initialization**
   - Create Next.js app with TypeScript
   - Install dependencies: Tailwind, shadcn/ui, usehooks-ts, Tone.js
   - Configure ESLint, Prettier, Git

2. **Data Models & Types**
   ```typescript
   interface Note {
     id: string;
     time: number;        // Time position in beats
     pitch: string;       // Note name (C4, D#4, etc.)
     duration: number;    // Duration in beats
     color: string;       // Hex color
   }

   interface RepeatMarker {
     id: string;
     time: number;
     type: 'start' | 'end';
   }

   interface Song {
     id: string;
     title: string;
     tempo: number;       // BPM
     timeSignature: { top: number; bottom: number };
     notes: Note[];
     repeatMarkers: RepeatMarker[];
     createdAt: Date;
     updatedAt: Date;
   }
   ```

3. **Color System Design**
   - Define color palette for notes
   - Map colors to piano keys and staff positions
   - Ensure accessibility (contrast, colorblind-friendly)

4. **Basic Layout Structure**
   - Header with app title and controls
   - Main composition area (staff placeholder)
   - Piano section at bottom
   - Side panel for song library (collapsible)

#### Deliverables
- Working Next.js app with routing
- TypeScript interfaces for all core data
- Basic responsive layout

---

### **Phase 2: Staff & Visual System** (Weeks 3-4)

#### Goals
Build the SVG-based musical staff with time-based positioning

#### Tasks
1. **3-Line Staff Component**
   - SVG container with proper viewBox
   - Render 3 horizontal lines with correct spacing
   - Grid system based on time divisions (measures, beats)
   - Scalable/responsive design

2. **Time-to-Position Conversion Utilities**
   ```typescript
   // Convert time (in beats) to SVG x-coordinate
   function timeToX(time: number, tempo: number, width: number): number;
   
   // Convert pitch to SVG y-coordinate (staff line position)
   function pitchToY(pitch: string, staffHeight: number): number;
   
   // Snap time to nearest grid position
   function snapToGrid(time: number, subdivision: number): number;
   ```

3. **Note Component**
   - Render note head with correct color
   - Position based on time and pitch (converted to SVG coords)
   - Duration line extending from note
   - Hover/select states

4. **Staff Markers**
   - Measure lines
   - Beat subdivisions (optional visual guides)
   - Clef symbol (simplified for 3-line system)

5. **Export Functionality**
   - Convert SVG to PNG using canvas
   - Download SVG with proper formatting
   - Clean export (remove interactive elements, selection states)

#### Deliverables
- Functional staff that displays notes
- Export buttons (PNG and SVG)
- Clean, print-ready exports

---

### **Phase 3: Interactive Piano** (Weeks 5-6)

#### Goals
Create a playable piano interface with audio

#### Tasks
1. **Piano Keyboard UI**
   - Render white keys (full octaves)
   - Render black keys (sharps) correctly positioned
   - Color-code keys to match note colors
   - Responsive sizing

2. **Audio Integration**
   - Install Tone.js
   - Load/generate piano samples for all keys
   - Create sampler or synthesizer
   ```typescript
   const sampler = new Tone.Sampler({
     urls: {
       C4: "C4.mp3",
       "D#4": "Ds4.mp3",
       // ... all notes
     },
     baseUrl: "/audio/piano/"
   }).toDestination();
   ```

3. **Keyboard Input Mapping**
   - Map QWERTY keyboard to piano keys
   - Handle key down/up events
   - Prevent repeat firing
   - Visual feedback on key press

4. **Sustain Pedal**
   - Spacebar to activate sustain
   - Alternative: Shift key
   - Visual indicator when sustain is active
   - Extend note release when active

5. **Visual Feedback**
   - Key press animation (scale, color change)
   - Active key highlighting
   - Sound wave or ripple effect (optional)

#### Deliverables
- Fully playable piano keyboard
- Keyboard mapping for computer keys
- Working sustain pedal
- Clear visual feedback

---

### **Phase 4: Note Editing & Composition** (Weeks 7-8)

#### Goals
Enable users to compose music by placing and editing notes

#### Tasks
1. **Click-to-Place Notes**
   - Click on staff to place note
   - Automatically snap to nearest grid position (time and pitch)
   - Default duration (e.g., quarter note)
   - Play sound preview on placement

2. **Drag & Drop System**
   - Make notes draggable
   - Show drag preview
   - Visual grid guides during drag
   - Snap to grid on release
   - Update note's time and pitch data

3. **Right-Click Context Menu**
   - Change duration (whole, half, quarter, eighth, etc.)
   - Change pitch/octave
   - Delete note
   - Copy/paste (future)

4. **Duration Line Visualization**
   - Calculate line length based on duration and tempo
   - Update line when duration changes
   - Visual differentiation (color, thickness)

5. **Repeat Markers**
   - Repeat symbol component (start/end brackets)
   - Place markers on staff
   - Drag to reposition
   - Store with time values
   - Visual distinction from notes

6. **Tempo Control**
   - BPM input/slider (range: 40-240)
   - Update all timing calculations when tempo changes
   - Display current tempo
   - Metronome visualization (optional)

7. **Selection & Multi-Edit**
   - Click to select single note
   - Drag to select multiple (future)
   - Delete selected notes (keyboard shortcut)

#### Deliverables
- Full note editing capabilities
- Functional repeat markers
- Tempo control with live updates
- Intuitive UX for composition

---

### **Phase 5: Playback Engine** (Weeks 9-10)

#### Goals
Accurate audio playback with visual synchronization

#### Tasks
1. **Playback Scheduler**
   - Use Tone.Transport for precise timing
   - Schedule all notes based on time and tempo
   - Handle repeat markers (loop sections)
   ```typescript
   function schedulePlayback(song: Song) {
     Tone.Transport.bpm.value = song.tempo;
     
     song.notes.forEach(note => {
       Tone.Transport.schedule((time) => {
         sampler.triggerAttackRelease(
           note.pitch,
           note.duration,
           time
         );
       }, note.time);
     });
     
     Tone.Transport.start();
   }
   ```

2. **Playback Cursor**
   - Animated line/cursor moving across staff
   - Sync position with Tone.Transport.position
   - Smooth animation (requestAnimationFrame or CSS)
   - Accurate timing (no drift)

3. **Note Highlighting**
   - Detect currently playing notes
   - Apply visual effect (glow, halo, scale)
   - Clear effect when note ends
   - Multiple simultaneous notes support

4. **Playback Controls**
   - Play button (start from beginning or cursor position)
   - Pause button (freeze at current position)
   - Stop button (return to start)
   - Seek/scrub functionality
   - Loop toggle

5. **Repeat Logic**
   - Detect repeat markers in song
   - Jump transport position on repeat end
   - Handle nested repeats (if needed)
   - Visual indication of repeat sections

6. **Audio Mixing**
   - Volume control
   - Optional: reverb or effects
   - Ensure no clipping or distortion

#### Deliverables
- Perfect playback synchronization
- Visual cursor and note highlights
- Full playback controls
- Repeat functionality

---

### **Phase 6: Data Persistence** (Week 11)

#### Goals
Save and load songs reliably

#### Tasks
1. **LocalStorage Integration**
   - Use usehooks-ts `useLocalStorage` hook
   - Serialize song data to JSON
   - Handle localStorage quota errors
   ```typescript
   const [songs, setSongs] = useLocalStorage<Song[]>('piano-app-songs', []);
   ```

2. **Song Library UI**
   - List all saved songs
   - Display metadata (title, date, tempo)
   - Search/filter songs
   - Sort options (date, name)
   - Delete confirmation dialog

3. **Save/Load Operations**
   - Save button (or auto-save)
   - Load song from library
   - Duplicate song
   - Rename song
   - Handle unsaved changes warning

4. **Auto-Save**
   - Debounce changes (e.g., 2 seconds)
   - Visual indicator (saving... saved!)
   - Prevent data loss on accidental navigation

5. **Backend Preparation**
   - Design API endpoints for future cloud sync
   ```typescript
   // Future API structure
   POST /api/songs          // Create song
   GET /api/songs           // List songs
   GET /api/songs/:id       // Get song
   PUT /api/songs/:id       // Update song
   DELETE /api/songs/:id    // Delete song
   ```
   - Plan database schema (Postgres, MongoDB, etc.)
   - Authentication strategy (NextAuth.js recommended)

#### Deliverables
- Reliable local storage
- Functional song library
- Auto-save implementation
- API design documentation

---

### **Phase 7: Polish & Testing** (Week 12)

#### Goals
Refine UX, fix bugs, optimize performance

#### Tasks
1. **User Testing**
   - Test with target audience (kids)
   - Observe pain points
   - Gather feedback on colors, interactions
   - Iterate on confusing UX

2. **Accessibility**
   - Keyboard navigation (tab through controls)
   - ARIA labels for screen readers
   - Color contrast checks (WCAG AA)
   - Focus indicators
   - Alternative text for visual elements

3. **Performance Optimization**
   - Optimize SVG rendering (virtualization if needed)
   - Memoize expensive calculations
   - Lazy load audio samples
   - React component optimization (memo, useMemo, useCallback)

4. **Responsive Design**
   - Mobile layout (stacked piano, simplified staff)
   - Tablet layout (side-by-side or split view)
   - Touch interactions (drag, tap, pinch-to-zoom)

5. **Edge Cases & Bug Fixes**
   - Empty song state
   - Maximum notes limit (performance)
   - Overlapping notes handling
   - Extreme tempo values
   - Browser compatibility (Chrome, Firefox, Safari, Edge)

6. **Loading & Error States**
   - Loading spinners
   - Error messages (friendly, actionable)
   - Offline support (PWA considerations)

7. **Documentation**
   - README with setup instructions
   - Code comments for complex logic
   - User guide or tutorial (optional)

#### Deliverables
- Polished, bug-free MVP
- Accessible to all users
- Performance benchmarks met
- Ready for deployment

---

## Future Enhancements (Post-MVP)

### **Phase 8: Microphone Input & Pitch Detection** (Weeks 13-15)

#### Goals
Allow users to play on their real piano and detect what they're playing

#### Features
1. **Browser Microphone Access**
   - Request microphone permission
   - Audio stream capture
   - Privacy considerations (no recording stored)

2. **Pitch Detection**
   - Use Web Audio API `AnalyserNode`
   - Implement pitch detection algorithm (autocorrelation, YIN, or library like Pitchfinder.js)
   - Detect fundamental frequency
   - Convert frequency to note name
   ```typescript
   function detectPitch(audioBuffer: Float32Array): string | null {
     // Run pitch detection algorithm
     const frequency = pitchDetector.detect(audioBuffer);
     if (!frequency) return null;
     
     // Convert to note name
     return frequencyToNote(frequency);
   }
   ```

3. **Calibration UI**
   - Test/correction interface
   - Ask user to play known notes (C4, G4, etc.)
   - Compare detected pitch to expected pitch
   - Calculate tuning offset
   - Display accuracy meter
   - Save calibration settings

4. **Real-Time Note Detection Display**
   - Show detected notes in real-time
   - Visual feedback (color-coded indicator)
   - Confidence meter (how certain the detection is)
   - Note history (last 5-10 notes played)

#### Technical Challenges
- Handling background noise
- Polyphonic detection (multiple notes at once) - start with monophonic
- Latency issues
- Different piano tunings

---

### **Phase 9: Gamification & Practice Modes** (Weeks 16-18)

#### Goals
Make practice fun and track student progress

#### Features
1. **Practice Modes**
   - **Follow Along:** Notes appear, student plays them
   - **Rhythm Mode:** Timing-focused (notes are correct, just check timing)
   - **Pitch Mode:** Pitch-focused (timing is lenient)
   - **Memory Mode:** Notes disappear after showing briefly
   - **Full Performance:** Both timing and pitch scored

2. **Scoring System**
   - **Timing Score:** How close to the beat (±100ms tolerance)
   - **Correctness Score:** Right notes played
   - **Combo Score:** Consecutive correct notes
   - **Overall Score:** Weighted combination of all metrics
   
   ```typescript
   interface PerformanceScore {
     timing: number;        // 0-100
     correctness: number;   // 0-100
     combo: number;         // Max consecutive correct
     overall: number;       // 0-100
     stars: number;         // 0-3 (based on overall score)
   }
   ```

3. **Visual Feedback During Play**
   - Real-time note matching (green = correct, red = wrong)
   - Timing indicator (early/late)
   - Combo counter
   - Progress bar

4. **Stickers & Achievements**
   - Earn stickers for milestones
   - Achievement badges (100 songs, perfect score, etc.)
   - Sticker collection page
   - Shareable achievement cards

5. **Difficulty Levels**
   - Easy: Simple melodies, slow tempo, visual aids
   - Medium: More complex, moderate tempo
   - Hard: Full pieces, faster tempo, fewer hints

6. **Progress Tracking**
   - Practice history (songs played, dates, scores)
   - Improvement charts (line graphs)
   - Streak counter (days practiced)
   - Time spent practicing

7. **Multiplayer/Social (Future)**
   - Challenge friends
   - Leaderboards
   - Share performances

#### UI Components
- Practice mode selector
- Live score display
- Results screen with breakdown
- Sticker showcase
- Progress dashboard

---

### **Phase 10: Online Sync & Cloud Features** (Weeks 19-21)

#### Features
1. **User Authentication**
   - NextAuth.js setup
   - Google/email sign-in
   - Profile management

2. **Cloud Database**
   - PostgreSQL or MongoDB
   - Store songs, user data, progress
   - Real-time sync

3. **Multi-Device Access**
   - Sync across devices
   - Conflict resolution (last-write-wins or merge)

4. **Sharing Features**
   - Public song library
   - Share songs via link
   - Embed songs in websites

5. **Backup & Restore**
   - Automatic cloud backups
   - Restore deleted songs
   - Export all data (GDPR compliance)

---

### **Phase 11: Content Library & Curriculum** (Weeks 22-24)

#### Features
1. **Pre-Made Songs**
   - Curated library of kid-friendly songs
   - Categorized by difficulty, theme, age
   - Popular tunes (Happy Birthday, Twinkle Twinkle, etc.)

2. **Lesson Plans**
   - Structured curriculum (Week 1, Week 2, etc.)
   - Learning objectives for each lesson
   - Progressive difficulty

3. **Tutorial System**
   - Interactive onboarding
   - Video tutorials
   - In-app tooltips and hints

4. **Teacher/Parent Dashboard**
   - Monitor student progress
   - Assign songs
   - View practice reports

---

### **Phase 12: Advanced Features** (Future)

#### Potential Features
- **MIDI Support:** Connect real MIDI keyboard
- **Recording:** Record performances and save as audio
- **Transpose:** Change key of songs
- **Accompaniment:** Play along with backing tracks
- **Notation Printing:** Generate professional sheet music PDFs
- **Music Theory Lessons:** Integrated learning modules
- **AI Practice Buddy:** Adaptive difficulty based on performance
- **Offline PWA:** Full offline functionality

---

## Technical Architecture

### Frontend Structure
```
src/
├── app/
│   ├── page.tsx                 # Home/composition page
│   ├── practice/page.tsx        # Practice mode
│   ├── library/page.tsx         # Song library
│   └── layout.tsx               # Root layout
├── components/
│   ├── Staff/
│   │   ├── Staff.tsx            # Main staff component
│   │   ├── Note.tsx             # Note component
│   │   ├── RepeatMarker.tsx     # Repeat symbol
│   │   └── PlaybackCursor.tsx   # Animated cursor
│   ├── Piano/
│   │   ├── Piano.tsx            # Piano keyboard
│   │   ├── Key.tsx              # Individual key
│   │   └── PedalIndicator.tsx   # Sustain indicator
│   ├── Controls/
│   │   ├── PlaybackControls.tsx # Play/pause/stop
│   │   ├── TempoControl.tsx     # BPM slider
│   │   └── ExportButtons.tsx    # PNG/SVG export
│   └── ui/                       # shadcn/ui components
├── hooks/
│   ├── useAudio.ts              # Audio playback hook
│   ├── usePitchDetection.ts     # Microphone input
│   ├── usePlayback.ts           # Playback state
│   └── useSongStorage.ts        # LocalStorage hook
├── lib/
│   ├── audio.ts                 # Tone.js utilities
│   ├── conversion.ts            # Time/pitch conversions
│   ├── export.ts                # PNG/SVG export logic
│   └── musicTheory.ts           # Note calculations
├── types/
│   └── index.ts                 # All TypeScript types
└── stores/
    └── songStore.ts             # Zustand/Jotai store
```

### State Management Strategy
- **Local Component State:** useState for simple, isolated state
- **Global State (Zustand):** Song data, playback state, user settings
- **URL State:** Current song ID (Next.js routing)
- **LocalStorage:** Persisted songs and preferences

### Key Libraries
| Purpose | Library | Notes |
|---------|---------|-------|
| Audio | Tone.js | Scheduling, synthesis, effects |
| Pitch Detection | Pitchfinder.js | Autocorrelation algorithm |
| Drag & Drop | dnd-kit | Accessible drag-and-drop |
| Animations | Framer Motion | Smooth transitions |
| Forms | React Hook Form | Tempo, song metadata |
| State | Zustand | Lightweight, simple API |

---

## Performance Considerations

### Optimization Strategies
1. **SVG Rendering**
   - Use `will-change` CSS property for animated elements
   - Limit number of DOM nodes (virtualize if >1000 notes)
   - Debounce expensive calculations during drag

2. **Audio**
   - Lazy load audio samples
   - Use audio sprite sheets for small sounds
   - Limit simultaneous voices (polyphony limit)

3. **React**
   - Memoize components that don't change often
   - Use `useCallback` for event handlers
   - Virtualize long lists (song library)

4. **Storage**
   - Compress song data before storing
   - Use IndexedDB for large datasets (instead of localStorage)

---

## Testing Strategy

### Unit Tests
- Utility functions (time conversions, note calculations)
- Audio scheduling logic
- Data serialization/deserialization

### Integration Tests
- Note placement and dragging
- Playback accuracy
- Save/load operations

### E2E Tests (Playwright/Cypress)
- Complete user flows
- Cross-browser compatibility
- Performance benchmarks

### User Testing
- Usability testing with kids (ages 6-12)
- Accessibility testing with assistive technologies
- A/B testing for UI variations

---

## Deployment & DevOps

### Hosting Options
- **Vercel:** Recommended for Next.js (zero-config)
- **Netlify:** Alternative with edge functions
- **Cloudflare Pages:** CDN + serverless

### CI/CD Pipeline
1. Push to GitHub
2. Run tests (unit, integration)
3. Build production bundle
4. Deploy to staging
5. Manual approval
6. Deploy to production

### Monitoring
- **Error Tracking:** Sentry
- **Analytics:** Vercel Analytics or Plausible
- **Performance:** Lighthouse CI

---

## Timeline Summary

| Phase | Duration | Focus |
|-------|----------|-------|
| 1 | 2 weeks | Foundation & setup |
| 2 | 2 weeks | Staff & visual system |
| 3 | 2 weeks | Interactive piano |
| 4 | 2 weeks | Note editing & composition |
| 5 | 2 weeks | Playback engine |
| 6 | 1 week | Data persistence |
| 7 | 1 week | Polish & testing |
| **MVP Total** | **12 weeks** | **Core product** |
| 8 | 3 weeks | Microphone input |
| 9 | 3 weeks | Gamification |
| 10 | 3 weeks | Online sync |
| 11 | 3 weeks | Content library |
| 12 | Ongoing | Advanced features |

---

## Success Metrics

### MVP Launch
- [ ] 100 songs created by users
- [ ] Average session time > 10 minutes
- [ ] <3% error rate
- [ ] Works on 95% of modern browsers

### Post-Launch (3 months)
- [ ] 1,000 active users
- [ ] 70% user retention (week 1)
- [ ] Average practice time: 15 min/day
- [ ] NPS score > 50

### Long-Term (1 year)
- [ ] 10,000+ users
- [ ] 50,000+ songs in library
- [ ] Partnerships with music schools
- [ ] Mobile app launch (React Native)

---

## Risk Mitigation

### Technical Risks
| Risk | Mitigation |
|------|------------|
| Audio latency issues | Test early, use Tone.js Transport, Web Audio API best practices |
| Browser compatibility | Test on all major browsers, provide fallbacks |
| Performance with large songs | Implement virtualization, limit max notes |
| Pitch detection accuracy | Calibration UI, user feedback loop, improve algorithm iteratively |

### User Experience Risks
| Risk | Mitigation |
|------|------------|
| Too complex for kids | User testing, simplify UI, tutorial system |
| Not engaging enough | Gamification, rewards, colorful design |
| Difficulty curve too steep | Progressive difficulty, adaptive learning |

### Business Risks
| Risk | Mitigation |
|------|------------|
| Low user adoption | Marketing, partnerships with schools, free tier |
| Monetization challenges | Freemium model, premium features, B2B sales |
| Competition | Focus on unique value prop (color-coded, gamified) |

---

## Next Steps

1. **Start with Phase 1** - Set up the project and data models
2. **Build incrementally** - Each phase adds working features
3. **Get feedback early** - Test with real kids as soon as possible
4. **Iterate quickly** - Don't aim for perfection in MVP
5. **Document as you go** - Code comments, README updates

---

## Resources

### Learning Materials
- [Tone.js Documentation](https://tonejs.github.io/)
- [Web Audio API Guide](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Music Theory Basics](https://www.musictheory.net/)
- [Next.js Docs](https://nextjs.org/docs)

### Design Inspiration
- [Noteflight](https://www.noteflight.com/) - Online music notation
- [Chrome Music Lab](https://musiclab.chromeexperiments.com/) - Interactive music tools
- [Simply Piano](https://www.hellosimplypiano.com/) - Gamified piano learning

### Tools
- [Figma](https://www.figma.com/) - UI design
- [Tone.js Playground](https://tonejs.github.io/examples/) - Audio experimentation
- [SVG Path Visualizer](https://svg-path-visualizer.netlify.app/) - SVG debugging

---

*This roadmap is a living document. Update it as the project evolves and new requirements emerge.*
