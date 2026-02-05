# Memory Game – Greek Alphabet

A simple, playable memory card-matching game built with HTML, CSS, and JavaScript. No frameworks, no backend. Ideal for eLitmus Management Trainee assignment and interview demos.

---

## Features

- **Core gameplay:** Match pairs; score mode (100 points, −4 per wrong pair) or **Lives mode** (3 lives, −1 per wrong pair). Win by matching all pairs before score hits 0 or lives hit 0.
- **Countdown mode:** Optional 60-second countdown; game over when time hits 0.
- **Combo bonus:** +5 points for consecutive correct matches (score mode only, cap 100).
- **Move counter & timer:** Moves count and elapsed time (or countdown when enabled).
- **Hint:** One per game (key **H** or button)—reveals one matching pair briefly.
- **Undo:** Once per game after a wrong pair—reverts the last move and restores score/life.
- **Difficulty:** Easy (4 pairs), Medium (8 pairs), Hard (12 pairs).
- **Symbol sets:** Greek, Numbers, or Emojis.
- **Themes:** Default, Ocean, Forest, Sunset (card back and accent colours).
- **Dark mode:** Toggle (saved in localStorage).
- **Best score & best time:** Saved per difficulty; shown in stats bar and Statistics panel.
- **Statistics panel:** Games played, wins, best score, best time, last 5 scores (collapsible).
- **Restart options:** “New shuffle” (new random layout) or “Same board” (same layout, reset score/moves).
- **Sound:** Flip, match, wrong, and win sounds (mute checkbox).
- **Visual feedback:** Green on match, shake + red on wrong; card hover; confetti on win.
- **Ready countdown:** 3, 2, 1, Go! before each game.
- **Keyboard:** **R** = Restart (new shuffle), **H** = Hint; Tab and arrow keys to move, Enter/Space to flip a card.
- **Accessibility:** Reduced motion respected; focus styles for keyboard.
- **Layout:** Top navbar (game name + Sound, Dark, Theme). Main area: **game board on the left**, **Statistics & settings on the right**. On smaller screens the sides swap (settings left, board right); on very narrow screens it stacks (settings on top, board below).
- **Footer credit:** eLitmus Assignment · Memory Game.

You can add a screenshot or short GIF of the game here to help reviewers.

---

## Project Overview

This is a **Memory Game** (also called a matching game). You see 16 cards face-down in a grid. Each card hides a Greek letter. Every letter appears on **exactly two cards**. Your job is to find all 8 pairs by turning over two cards at a time. If they match, they stay open. If not, they flip back and you lose points. The game ends when you match all pairs (win) or your score hits zero (lose).

---

## Game Rules

- Cards start **face-down**. Each symbol appears **exactly twice** (pairs depend on difficulty).
- Choose **Symbols** (Greek, Numbers, Emojis), **Difficulty** (Easy/Medium/Hard), and **Mode** (Score or Lives).
- Optional **Countdown 60s**: game ends if time reaches 0.
- You click **two cards** (or use keyboard: focus card, Enter/Space):
  - **Match:** Cards stay open. In score mode, two matches in a row give a **combo bonus** (+5).
  - **No match:** Cards flip back after a short delay; you lose 4 points (score) or 1 life (lives).
- **Hint (H):** Once per game, reveals one pair briefly.
- **Undo:** Once per game after a wrong pair, reverts that move.
- **Game ends** when: all pairs matched → **Win**; or score 0 / lives 0 / countdown 0 → **Lose**.
- Use **New shuffle** or **Same board** to play again.

---

## Scoring Logic

- **Starting score:** 100 points.
- **Wrong pair:** Subtract 4 points (score never goes below 0).
- **Correct pair:** No change to score; cards stay open.
- **Win:** All 8 pairs matched before score reaches 0.
- **Lose:** Score becomes 0 before all pairs are matched.

---

## How to Run Locally

1. **Unzip or clone** the project so you have a folder (e.g. `memory-game`) with:
   - `index.html`
   - `style.css`
   - `script.js`
2. **Open the folder** in File Explorer (Windows) or Finder (Mac).
3. **Double-click `index.html`** to open it in your default browser.  
   **Or** right-click `index.html` → “Open with” → choose Chrome, Edge, or Firefox.
4. The game loads immediately. No server or installation needed.

---

## How Scoring Can Be Modified

In `script.js` (top of file):

- **Starting score:** `STARTING_SCORE` (default 100).
- **Penalty per wrong pair:** `WRONG_PAIR_PENALTY` (default 4).
- **Lives mode starting lives:** `STARTING_LIVES` (default 3).
- **Combo bonus:** `COMBO_BONUS` (default 5) for consecutive matches.
- **Countdown length:** `COUNTDOWN_SECONDS` (default 60).

Save the file and refresh the browser to see the new behaviour.

---

## Possible Further Enhancements

- **More symbol sets** (e.g. shapes, colours).
- **Leaderboard** or share result (copy score to clipboard).
- **Custom themes** or user-defined card colours.
- **Longer countdown** option (e.g. 90 or 120 seconds).

---

## How AI Was Used

- **Design and structure:** AI helped choose a simple file structure (HTML, CSS, JS) and game flow (flip, match, score, end, restart).
- **Code writing:** AI wrote the initial HTML, CSS, and JavaScript with clear names and comments so each part (scoring, matching, shuffle, game end) is easy to find and explain.
- **Documentation:** AI drafted this README and the deployment steps in plain language.
- **Review:** The logic (scoring, win/lose, disabling clicks) was checked against the assignment requirements so the game behaves exactly as specified.

---

## Deployment

### Option A: GitHub Pages (recommended)

1. Create a **GitHub account** if you don’t have one (github.com).
2. Create a **new repository** (e.g. `memory-game`). Do not add a README or .gitignore yet.
3. On your computer, open a terminal in the **memory-game** folder (where `index.html`, `style.css`, `script.js` are).
4. Run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Memory Game"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/memory-game.git
   git push -u origin main
   ```
   Replace `YOUR_USERNAME` with your GitHub username.
5. On GitHub: open your repo → **Settings** → **Pages** (left sidebar).
6. Under “Source”, choose **Deploy from a branch**.
7. Branch: **main**, folder: **/ (root)**. Click **Save**.
8. After a minute or two, your game will be at:  
   `https://YOUR_USERNAME.github.io/memory-game/`

### Option B: Netlify (drag and drop)

1. Go to [netlify.com](https://www.netlify.com) and sign up (free).
2. Drag and drop your **memory-game** folder (the one containing `index.html`, `style.css`, `script.js`) onto the Netlify “Deploy” area.
3. Netlify will give you a link like `https://random-name-123.netlify.app`. Your game is live.

**Important:** For both options, make sure you upload the folder that **contains** `index.html`, not the parent folder. The site must open `index.html` at the root.

---

## Interview: “How I Built This” (2–3 minutes)

You can say something like this:

- **Approach:** “I treated it as a small web app with three parts: structure (HTML), look and animation (CSS), and behaviour (JavaScript). I listed the rules first—cards face-down, two clicks, match or not, score 100 minus 4 per wrong pair, game over on win or zero score—and then implemented each part.”
- **AI use:** “I used AI to generate the initial code and comments so the logic is easy to follow. I made sure I could explain every important part: where the score is updated, how we check a match, how we detect win or lose, and how the shuffle works. I also used AI to draft the README and deployment steps.”
- **Verification:** “I checked that the game matches the assignment: 8 pairs of Greek symbols, 100 points, 4-point penalty, game over when all matched or score zero, restart button, and no clicking after game over. I ran it in the browser and walked through win and lose cases to confirm.”

---

## Modification Cheat-Sheet (for live changes in interview)

Use this when the interviewer asks you to change something. Line numbers are approximate.

| What to change | File | Where | What to do |
|----------------|------|--------|------------|
| **Starting score** | `script.js` | Top (config) | Change `STARTING_SCORE = 100` to the new value. |
| **Penalty per wrong pair** | `script.js` | Top (config) | Change `WRONG_PAIR_PENALTY = 4` to the new value. |
| **Number of pairs / difficulty** | `script.js` | `PAIRS_BY_DIFFICULTY` | Edit `easy`, `medium`, `hard` values. Add more symbols to `ALL_GREEK` (or the set in use) if needed. |
| **Change symbols** | `script.js` | `SYMBOL_SETS`, `ALL_GREEK` / `ALL_NUMBERS` / `ALL_EMOJIS` | Edit or add arrays; symbol-set dropdown uses these. |
| **Delay before cards flip back** | `script.js` | `FLIP_BACK_DELAY_MS` | Change `800` to another value in milliseconds. |
| **Grid columns** | `style.css` | `.card-grid.cols-*` | Adjust `.cols-2`, `.cols-4`, `.cols-6` or add `.cols-5` and set `grid-template-columns: repeat(5, 1fr)`. |
| **Sound on/off default** | `index.html` | `#mute-btn` | Add `checked` to the input to start muted. |
| **Countdown length** | `script.js` | `COUNTDOWN_SECONDS` | Change from 60 to another value (seconds). |
| **Combo bonus** | `script.js` | `COMBO_BONUS` | Change from 5 to another points value. |
| **Lives count** | `script.js` | `STARTING_LIVES` | Change from 3 to another value. |
| **Symbol sets** | `script.js` | `SYMBOL_SETS`, `ALL_GREEK` / `ALL_NUMBERS` / `ALL_EMOJIS` | Add or edit symbol arrays. |
| **Theme / dark** | `script.js` or UI | Theme dropdown, Dark checkbox | Persisted in localStorage. |
| **Best score / stats keys** | `script.js` | `KEY_BEST_SCORE`, `KEY_STATS`, etc. | Change if you want separate data per variant. |

---

## File Structure

```
memory-game/
├── index.html   (structure: header, how to play, stats bar, difficulty, overlay, card grid, footer)
├── style.css    (layout, card flip, match/wrong feedback, overlay, responsive rules)
├── script.js    (game logic: moves, timer, difficulty, high score, sounds, win/lose, restart)
└── README.md    (this file)
```

---

Good luck with your assignment and interview.
