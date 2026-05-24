// Split-flap display
(function () {
  const COLS = 18;
  const ROWS = 3;
  const TILE_DELAY = 28;
  const HOLD_MS = 3500;

  // 3 lines each, exactly 18 chars per line (pad with spaces)
  const MESSAGES = [
    [' STAY  HUNGRY  ', ' STAY  FOOLISH  ', '  - STEVE JOBS  '],
    [' TALK IS CHEAP ', ' SHOW  ME  THE  ', '      CODE      '],
    ['  MAKE IT WORK ', ' MAKE  IT RIGHT ', '  MAKE IT FAST  '],
    ['  FIRST SOLVE  ', '   THE PROBLEM  ', '  THEN CODE IT  '],
    ['  SIMPLICITY   ', '   IS THE SOUL  ', '  OF EFFICIENCY '],
    [' SHIP IT EARLY ', ' SHIP  IT OFTEN ', '  LEARN FASTER  '],
    ['  EVERY EXPERT ', '   WAS ONCE A   ', '    BEGINNER    '],
    ['  CLEAN  CODE  ', '  CLEAR  MIND   ', ' GREAT  PRODUCT '],
    ['  DEBUG TWICE  ', '  DEPLOY  ONCE  ', '   SLEEP WELL   '],
    [' READ THE DOCS ', '  WRITE  TESTS  ', '  SHIP  BOLDLY  '],
    ['  CONSISTENCY  ', '     BEATS      ', '     TALENT     '],
    ['  ONE  COMMIT  ', '   AT  A  TIME  ', ' MOVES MOUNTAINS'],
    ['  DARE TO BEGIN', '  DARE  TO FAIL ', '  DARE  TO WIN  '],
    ['  LEARN ALWAYS ', '   GROW  DAILY  ', '  NEVER SETTLE  '],
    [' CODE  IS CRAFT', '  DESIGN IS ART ', '  - SUMEET  K   '],
    ['  THINK DEEPLY ', '   ACT  BOLDLY  ', '  BUILD THINGS  '],
    ['  GREAT  CODE  ', '   IS WRITTEN   ', '   FOR HUMANS   '],
    ['  THE BEST BUG ', '   IS THE ONE   ', '  YOU PREVENT   '],
    ['  BUILD THINGS ', '  PEOPLE  LOVE  ', '  NOT JUST USE  '],
    ['  NEVER  STOP  ', '    LEARNING    ', '     ALWAYS     '],
    ['  WRITE  CODE  ', '  AS IF THE NEXT', '  DEV IS YOU    '],
    ['  DONE IS BETTER', '    THAN        ', '    PERFECT     '],
    ['  FALL  SEVEN  ', '   RISE  EIGHT  ', '  - JAPANESE    '],
    ['  WORK  HARD   ', '  STAY HUMBLE   ', '  KEEP CODING   '],
    ['  PROBLEMS ARE ', '  JUST PUZZLES  ', '  IN DISGUISE   '],
  ];

  function pad(str, len) {
    const s = String(str).toUpperCase();
    if (s.length >= len) return s.slice(0, len);
    const left  = Math.floor((len - s.length) / 2);
    const right = len - s.length - left;
    return ' '.repeat(left) + s + ' '.repeat(right);
  }

  function makeTile() {
    const tile  = document.createElement('div');
    tile.className = 'flip-tile';
    const front = document.createElement('div');
    front.className = 'flip-face flip-front';
    front.textContent = ' ';
    const back  = document.createElement('div');
    back.className = 'flip-face flip-back';
    back.textContent = ' ';
    tile.appendChild(front);
    tile.appendChild(back);
    return { tile, front, back };
  }

  function buildBoard(container) {
    container.innerHTML = '';
    const grid = [];
    for (let r = 0; r < ROWS; r++) {
      const row = document.createElement('div');
      row.className = 'flip-row';
      grid[r] = [];
      for (let c = 0; c < COLS; c++) {
        const t = makeTile();
        row.appendChild(t.tile);
        grid[r][c] = t;
      }
      container.appendChild(row);
    }
    return grid;
  }

  function flipTile(tileObj, newChar) {
    return new Promise(resolve => {
      const { tile, front, back } = tileObj;
      if (front.textContent === newChar) { resolve(); return; }
      back.textContent = newChar;
      tile.classList.remove('flipping');
      void tile.offsetWidth; // force reflow
      tile.classList.add('flipping');
      setTimeout(() => {
        tile.classList.remove('flipping');
        front.textContent = newChar;
        back.textContent  = newChar;
        resolve();
      }, 520);
    });
  }

  function showMessage(grid, lines) {
    const promises = [];
    for (let r = 0; r < ROWS; r++) {
      const line = pad(lines[r] || '', COLS);
      for (let c = 0; c < COLS; c++) {
        const delay = (r * COLS + c) * TILE_DELAY;
        promises.push(new Promise(res => {
          setTimeout(() => flipTile(grid[r][c], line[c]).then(res), delay);
        }));
      }
    }
    return Promise.all(promises);
  }

  async function run(grid) {
    let idx = 0;
    while (true) {
      await showMessage(grid, MESSAGES[idx]);
      await new Promise(r => setTimeout(r, HOLD_MS));
      idx = (idx + 1) % MESSAGES.length;
    }
  }

  function init() {
    const container = document.getElementById('flipping-board');
    if (!container) return;
    run(buildBoard(container));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
