# 한 수 — design contract

## 0. Research Log
Embedded references: shortlist Claude, Notion, Apple; selected Claude's warm editorial palette with minimalist UI reference. Adapted parchment, serif/sans contrast and restrained separators. Board uses dimensional wood and ivory pieces as a deliberate material exception to flat UI. Rule reference: https://www.pychess.org/variants/janggi . No third-party visual assets or runtime dependencies.

## 1. Direction
A quiet Korean game room: paper, walnut ink, sage controls, an inset maple board. The memorable object is the playable board and its matte porcelain circular pieces. Content order: identity, game setup/status, board, history and help.
## 2. Tokens
Canvas #f6f5f0; surface #fffefa; ink #303a31; muted #70766c; border #dedfd5; sage #526b50; sage wash #e9eee4; wood #e7c99a; wood line #917347; blue #315e89; red #a44839; ivory #fff5dc. Base spacing 4px; scale 4/8/12/16/20/24/32/40/48/64. Radii 6/12/20px. Board-specific relative sizing tracks intersections.
## 3. Typography
UI: system sans-serif with Apple SD Gothic Neo and Malgun Gothic. Editorial: Georgia, Batang, Songti SC, serif. Pieces: PingFang SC, Apple SD Gothic Neo, Malgun Gothic, sans-serif at weight 500, normal pieces 18–28px and kings 22–32px. Scale 11/12/13/14/16/18/24/32px; title 36px desktop, 28px mobile.
## 4. Layout
Max width 1160px. Two-column game surface: flexible board and 300px rail. Below 850px stack; below 480px reduce margins. Document owns scrolling; history is bounded and independently scrollable. Board preserves a 9:10 aspect ratio.
## 5. Primitives and states
Button: primary sage, secondary ivory, disabled opacity, hover tonal wash, visible keyboard focus. Piece: circular matte porcelain (#fffdf7), a thin neutral edge (#d9cfbc), restrained contact shadow (#4d3d2824), and a 2px warm base (#c9bda5). Blue Cho/red Han glyphs use a medium sans weight and generous breathing room. Normal diameter 78% of a cell, king 88%; no inset bevel ornament. Selected piece uses sage fill with porcelain text and lifts 2px. Legal capture uses a neutral dashed circular outline; legal empty moves retain sage dots. Hover lifts a piece 1px. Last move uses a subtle circular wash beneath the piece. Player row: icon, name, secondary role, turn label. Panel: warm surface, neutral border, 12px corners. Dialog: native modal with close and cancel. Segmented mode: selected solid surface with check-free clear contrast.
## 6. Motion
120ms opacity/transform for button and piece feedback; no decorative animation. Respect prefers-reduced-motion.
## 7. Accessibility
Korean language, labeled controls and all 90 board buttons; keyboard arrows on board, Enter/Space selection, live turn announcements, native modal focus handling. Piece identities use text as well as color. Small-phone board points are compact, with full grid-cell click targets.
## 8. Scope
Offline local single-player beginner AI and two-player shared-device game. Friendly rules: checkmate wins, bikjang acceptance / consecutive passes / threefold repetition draw. No tournament point adjudication or online multiplayer.
