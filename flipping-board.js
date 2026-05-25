// Split-flap display — improved with scramble + left-to-right typing
(function () {
  const COLS          = 18;
  const ROWS          = 3;
  const HOLD_MS       = 6200; // 3200 + 3000 extra
  const TILE_DELAY    = 36;   // ms between column starts (typing speed)
  const SCRAMBLE_STEPS = 2;   // random chars shown before landing
  const SCRAMBLE_FLIP  = 80;  // ms per scramble flip  (matches CSS .scrambling)
  const FINAL_FLIP     = 200; // ms for the real character (matches CSS .flipping)
  const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789*+-=#@';

  const MESSAGES = [
    [' STAY  HUNGRY  ', ' STAY  FOOLISH  ', '  - STEVE JOBS  '],
    [' TALK IS CHEAP ', ' SHOW  ME  THE  ', '      CODE      '],
    ['  MAKE IT WORK ', ' MAKE  IT RIGHT ', '  MAKE IT FAST  '],
    // ['  FIRST SOLVE  ', '   THE PROBLEM  ', '  THEN CODE IT  '],
    ['  SIMPLICITY   ', '   IS THE SOUL  ', '  OF EFFICIENCY '],
    // [' SHIP IT EARLY ', ' SHIP  IT OFTEN ', '  LEARN FASTER  '],
    ['  EVERY EXPERT ', '   WAS ONCE A   ', '    BEGINNER    '],
    // ['  CLEAN  CODE  ', '  CLEAR  MIND   ', ' GREAT  PRODUCT '],
    // ['  DEBUG TWICE  ', '  DEPLOY  ONCE  ', '   SLEEP WELL   '],
    // [' READ THE DOCS ', '  WRITE  TESTS  ', '  SHIP  BOLDLY  '],
    // ['  CONSISTENCY  ', '     BEATS      ', '     TALENT     '],
    ['  ONE  COMMIT  ', '   AT  A  TIME  ', ' MOVES MOUNTAINS'],
    ['  DARE TO BEGIN', '  DARE  TO FAIL ', '  DARE  TO WIN  '],
    // ['  LEARN ALWAYS ', '   GROW  DAILY  ', '  NEVER SETTLE  '],
    // [' CODE  IS CRAFT', '  DESIGN IS ART ', '  - SUMEET  K   '],
    // ['  THINK DEEPLY ', '   ACT  BOLDLY  ', '  BUILD THINGS  '],
    // ['  GREAT  CODE  ', '   IS WRITTEN   ', '   FOR HUMANS   '],
    ['  WHEN YOU KNOW ', '   WHAT TO BUILD ', '  BUILD IT NOW  '],
    ['  THE BEST BUG ', '   IS THE ONE   ', '  YOU PREVENT   '],
    ['  BUILD THINGS ', '  PEOPLE  LOVE  ', '  NOT JUST USE  '],
    // ['  NEVER  STOP  ', '    LEARNING    ', '     ALWAYS     '],
    ['  WRITE  CODE  ', '  AS IF THE NEXT', '  DEV IS YOU    '],
    // ['  FALL  SEVEN  ', '   RISE  EIGHT  ', '  - JAPANESE    '],
    ['  WORK  HARD   ', '  STAY HUMBLE   ', '  KEEP CODING   '],
    ['  PROBLEMS ARE ', '  JUST PUZZLES  ', '  IN DISGUISE   '],

    // ── New messages ──────────────────────────────────────────────
    // Move fast — Zuckerberg
    ['   MOVE FAST    ', '  BREAK THINGS  ', '   - MARK Z.    '],
    // Mandela
    [' IT ALWAYS SEEMS', ' IMPOSSIBLE UNTIL', '   IT IS DONE   '],
    // Knuth — premature optimisation
    [' PREMATURE OPT  ', '  IS ROOT OF ALL', '      EVIL      '],
    // DRY principle
    ["  DON'T REPEAT  ", '   YOURSELF     ', '  DRY PRINCIPLE '],
    // KISS
    ['  KEEP IT SIMPLE', '   AND STUPID   ', '  KISS PRINCIPLE'],
    // Good code = good docs
    ['  GOOD CODE IS  ', '  ITS OWN BEST  ', ' DOCUMENTATION  '],
    // Single responsibility
    ['  ONE FUNCTION  ', '    ONE JOB     ', '   DO IT WELL   '],
    // Navy SEAL / slow is smooth
    [' SLOW IS SMOOTH ', ' SMOOTH IS FAST ', '  TRUST THE REP '],
    // Build for users
    [' BUILD FOR USERS', '   NOT FOR YOUR ', '   PORTFOLIO    '],
    // Commit hygiene
    ['  COMMIT EARLY  ', '  COMMIT OFTEN  ', '  PUSH ALWAYS   '],
    // On the shoulders of giants
    [' STANDING ON THE', ' SHOULDERS OF   ', '    GIANTS      '],
    // Iterate
    ['  ITERATE FAST  ', '   FAIL OFTEN   ', '  LEARN ALWAYS  '],
    // Ownership
    ['  OWN YOUR CODE ', '  OWN YOUR BUGS ', '  OWN YOUR WINS '],
    // Security mindset
    [' SECURITY IS NOT', ' A FEATURE BUT  ', '   A MINDSET    '],
    // Innovation — Steve Jobs
    [' INNOVATION IS  ', '  SAYING NO TO  ', '  1000 THINGS   '],
    // Code review
    ['  CODE REVIEW IS', '  A GIFT NOT A  ', '  PUNISHMENT    '],
    // Documentation as love letter
    [' DOCUMENTATION  ', '  IS A LETTER   ', '  TO FUTURE YOU '],
    // Naming is hard — Knuth
    ['  NAMING THINGS ', '  IS THE HARDEST', '  PART OF CODE  '],
    // Automate
    [' AUTOMATE THE   ', '   BORING STUFF ', '  BUILD THE COOL'],
    // Version control
    ['VERSION CONTROL ', '   IS YOUR BEST ', '   SAFETY NET   '],
    // Open source
    ['  OPEN SOURCE   ', '   IS THE FUTURE', '   OF TECH      '],
    // Measure twice
    ['  MEASURE TWICE ', '   CUT ONCE     ', '  DEPLOY ONCE   '],
    // Write for humans — SICP
    ['  WRITE CODE FOR', '   THE NEXT DEV ', '  WHO READS IT  '],
    // Tests = sleep
    [' WRITE TESTS NOW', '  SLEEP SOUNDLY ', '  SHIP BOLDLY   '],
    // APIs
    ['  API FIRST THEN', '   BUILD THE UI ', '  THANK YOURSELF'],
    // Debugging
    ['  DEBUGGING IS  ', '  TWICE AS HARD ', '  AS WRITING IT '],
    // Complexity
    [' COMPLEXITY KILLS', '  SIMPLICITY    ', '    SCALES      '],
    // Grit
    ['   FALL SEVEN   ', '    RISE EIGHT  ', '  KEEP PUSHING  '],
    // Pipeline
    ['   CI / CD IS   ', '  NOT A LUXURY  ', '    A HABIT     '],

    
  ];

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  function pad(str, len) {
    const s = String(str).toUpperCase();
    if (s.length >= len) return s.slice(0, len);
    const left  = Math.floor((len - s.length) / 2);
    const right = len - s.length - left;
    return ' '.repeat(left) + s + ' '.repeat(right);
  }

  function makeTile() {
    const tile = document.createElement('div');
    tile.className = 'flip-tile';

    const front = document.createElement('div');
    front.className = 'flip-face flip-front';
    front.textContent = ' ';

    const back = document.createElement('div');
    back.className = 'flip-face flip-back';
    back.textContent = ' ';

    // Authentic split-flap midline seam
    const midline = document.createElement('div');
    midline.className = 'flip-midline';

    tile.appendChild(front);
    tile.appendChild(back);
    tile.appendChild(midline);
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

  // Single flip step — cls is 'flipping' or 'scrambling'
  function doFlip(tileObj, char, cls) {
    return new Promise(resolve => {
      const { tile, front, back } = tileObj;
      back.textContent = char;
      tile.classList.remove('flipping', 'scrambling');
      void tile.offsetWidth; // force reflow to restart animation
      tile.classList.add(cls);
      const duration = cls === 'scrambling' ? SCRAMBLE_FLIP : FINAL_FLIP;
      setTimeout(() => {
        tile.classList.remove('flipping', 'scrambling');
        front.textContent = char;
        back.textContent  = char;
        resolve();
      }, duration);
    });
  }

  // Flip a tile to a new character, scrambling through random chars first
  async function flipTile(tileObj, newChar) {
    if (tileObj.front.textContent === newChar) return;

    const isBlank = !newChar.trim();

    if (!isBlank) {
      // Wheel spins through random chars before landing
      for (let i = 0; i < SCRAMBLE_STEPS; i++) {
        const rand = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        await doFlip(tileObj, rand, 'scrambling');
      }
    }

    // Settle on the real character
    await doFlip(tileObj, newChar, 'flipping');
  }

  // Column-by-column left-to-right reveal (all rows advance together per column)
  function showMessage(grid, lines) {
    const padded = lines.map(l => pad(l || '', COLS));
    const all = [];

    for (let c = 0; c < COLS; c++) {
      const delay = c * TILE_DELAY;
      for (let r = 0; r < ROWS; r++) {
        const char    = padded[r][c];
        const tileObj = grid[r][c];
        all.push(sleep(delay).then(() => flipTile(tileObj, char)));
      }
    }

    return Promise.all(all);
  }

  async function run(grid) {
    let idx = 0;
    while (true) {
      await showMessage(grid, MESSAGES[idx]);
      await sleep(HOLD_MS);
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
