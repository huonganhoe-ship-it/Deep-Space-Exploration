# Changelog

All notable changes to this project will be documented in this file.

## [1.6.0] - 2026-04-06

### Added
- **Mission Live Broadcasts:** Integrated live YouTube mission control feeds for both **Artemis II** and the **ISS**.
- **Historical Archives:** Added historical launch footage for **Voyager 1** and **Apollo 11** with direct player interaction enabled.
- **Stealth Viewport:** Implemented CSS-based zoom and clipping for live mission broadcasts to hide external player branding.
- **Interaction Lock:** Added a transparent overlay and `pointer-events: none` to live mission broadcast iframes to prevent accidental UI triggers.

### Changed
- **ISS Mission View:** Added a new 'Live Broadcast' stage to the ISS camera feed.
- **Artemis II Lunar Approach:** Updated the Lunar Approach camera with high-resolution imagery of the Orion spacecraft flyby.
- **Artemis II Mission Status:** Updated Orion spacecraft location to the Lunar Sphere of Influence (382,700 km from Earth).
- **Signal Isolation:** Modified camera event logic to ensure live broadcasts remain uninterrupted by simulated signal loss or interference.
- **UI Refinement:** Automatically hide camera pan/tilt/zoom controls when live broadcast views are active.

## [1.5.0] - 2026-03-31

### Fixed
- **Troubleshooting Progress Reset Bug:** Fixed an issue where the troubleshooting progress would reset every second due to unstable callbacks in `InfoPanel.tsx` and `App.tsx`.
- **Stability Timer Dependency Bug:** Fixed a bug in `TroubleshootScreen.tsx` where the `stabilityTimer` dependency caused progress resets during critical recovery.
- **Local State Persistence Bug:** Added logic to reset local troubleshooting state when switching between celestial objects, preventing state leakage.
- **Success Handling Race Condition:** Refactored `TroubleshootScreen` to handle the success state more cleanly and prevent race conditions with the `onComplete` callback.
- **Component Re-render Optimization:** Wrapped key event handlers in `useCallback` to prevent unnecessary re-renders and logic resets in child components.
