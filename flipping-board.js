// Split-flap display — improved with scramble + left-to-right typing
(function () {
  const COLS = 18;
  const ROWS = 3;
  const HOLD_MS = 4500; // Hold each message longer for better readability
  const TILE_DELAY = 32;   // Slightly faster typing for smoother feel
  const SCRAMBLE_STEPS = window.innerWidth < 768 ? 1 : 3; // More scramble for drama
  const SCRAMBLE_FLIP = 70;  // Faster scramble
  const FINAL_FLIP = 180; // Slightly faster final flip
  const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789*+-=#@';

  const MESSAGES = [
    // ── Classic wisdom ──
    [' STAY  HUNGRY  ', ' STAY  FOOLISH  ', '  - STEVE JOBS  '],
    [' TALK IS CHEAP ', ' SHOW  ME  THE  ', '      CODE      '],
    ['  SIMPLICITY   ', '   IS THE SOUL  ', '  OF EFFICIENCY '],
    ['  DONE IS BETTER', '   THAN PERFECT ', '    - SHERYL S. '],
    
    // ── Growth mindset ──
    ['  EVERY EXPERT ', '   WAS ONCE A   ', '    BEGINNER    '],
    ['  CONSISTENCY  ', '     BEATS      ', '     TALENT     '],
    ['  DARE TO BEGIN', '  DARE  TO FAIL ', '  DARE  TO WIN  '],
    [' IT ALWAYS SEEMS', ' IMPOSSIBLE UNTIL', '   IT IS DONE   '],
    ['  LEARN ALWAYS  ', '   GROW  DAILY  ', '  NEVER SETTLE  '],
    
    // ── Execution & shipping ──
    ['  GET SHIT DONE ', '  - MIGUEL G.   ', '   SHIP IT NOW  '],
    ['   MOVE FAST    ', '  BREAK THINGS  ', '   - MARK Z.    '],
    ['  SHIPPING IS   ', '  THE BEST WAY  ', '   TO LEARN     '],
    ['  BUILD THINGS  ', '  PEOPLE  LOVE  ', '  NOT JUST USE  '],
    ['  ITERATE FAST  ', '   FAIL OFTEN   ', '  LEARN ALWAYS  '],
    
    // ── Code quality ──
    ['  WRITE  CODE   ', '  AS IF THE NEXT', '  DEV IS YOU    '],
    ['  GOOD CODE IS  ', '  ITS OWN BEST  ', ' DOCUMENTATION  '],
    ['  ONE FUNCTION  ', '    ONE JOB     ', '   DO IT WELL   '],
    ["  DON'T REPEAT  ", '   YOURSELF     ', '  DRY PRINCIPLE '],
    ['  KEEP IT SIMPLE', '   AND STUPID   ', '  KISS PRINCIPLE'],
    
    // ── Testing & reliability ──
    [' WRITE TESTS NOW', '  SLEEP SOUNDLY ', '  SHIP BOLDLY   '],
    ['  THE BEST BUG  ', '   IS THE ONE   ', '  YOU PREVENT   '],
    ['  DEBUGGING IS  ', '  TWICE AS HARD ', '  AS WRITING IT '],
    ['VERSION CONTROL ', '   IS YOUR BEST ', '   SAFETY NET   '],
    
    // ── Innovation & creativity ──
    [' INNOVATION IS  ', '  SAYING NO TO  ', '  1000 THINGS   '],
    ['  WHEN YOU KNOW ', '   WHAT TO BUILD', '  BUILD IT NOW  '],
    [' BUILD FOR USERS', '   NOT FOR YOUR ', '   PORTFOLIO    '],
    ['  PROBLEMS ARE  ', '  JUST PUZZLES  ', '  IN DISGUISE   '],
    
    // ── Mindset & philosophy ──
    [' SLOW IS SMOOTH ', ' SMOOTH IS FAST ', '  TRUST PROCESS '],
    ['  OWN YOUR CODE ', '  OWN YOUR BUGS ', '  OWN YOUR WINS '],
    [' SECURITY IS NOT', ' A FEATURE BUT  ', '   A MINDSET    '],
    [' COMPLEXITY KILLS', '  SIMPLICITY    ', '    SCALES      '],
    
    // ── Collaboration ──
    ['  CODE REVIEW IS', '  A GIFT NOT A  ', '  PUNISHMENT    '],
    [' STANDING ON THE', ' SHOULDERS OF   ', '    GIANTS      '],
    ['  OPEN SOURCE   ', '   IS THE FUTURE', '   OF TECH      '],
    [' DOCUMENTATION  ', '  IS A LETTER   ', '  TO FUTURE YOU '],
    
    // ── Best practices ──
    ['  COMMIT EARLY  ', '  COMMIT OFTEN  ', '  PUSH ALWAYS   '],
    ['   CI / CD IS   ', '  NOT A LUXURY  ', '    A HABIT     '],
    ['  API FIRST THEN', '   BUILD THE UI ', '  THANK YOURSELF'],
    ['  MEASURE TWICE ', '   CUT ONCE     ', '  DEPLOY ONCE   '],
    
    // ── Wisdom & craft ──
    ['  NAMING THINGS ', '  IS THE HARDEST', '  PART OF CODE  '],
    [' PREMATURE OPT  ', '  IS ROOT OF ALL', '      EVIL      '],
    [' AUTOMATE THE   ', '   BORING STUFF ', '  BUILD THE COOL'],
    ['  WORK  HARD    ', '  STAY HUMBLE   ', '  KEEP CODING   '],
    
    // ── New motivational additions ──
    ['  MAKE IT WORK  ', ' MAKE  IT RIGHT ', '  MAKE IT FAST  '],
    ['  FIRST SOLVE   ', '   THE PROBLEM  ', '  THEN CODE IT  '],
    ['  ONE  COMMIT   ', '   AT  A  TIME  ', ' MOVES MOUNTAINS'],
    ['  CODE IS CRAFT ', '  DESIGN IS ART ', '  SHIP IS LOVE  '],
    ['  THINK DEEPLY  ', '   ACT  BOLDLY  ', '  BUILD THINGS  '],
    ['  GREAT  CODE   ', '   IS WRITTEN   ', '   FOR HUMANS   '],
    ['  FALL  SEVEN   ', '   RISE  EIGHT  ', '  - JAPANESE    '],
    ['  NEVER  STOP   ', '    LEARNING    ', '   IMPROVING    '],
    ['  INVEST IN     ', '   KNOWLEDGE    ', '  PAYS INTEREST '],
    ['  BE EXCEPTIONAL', '   IN EVERYTHING', '    YOU DO      '],
    ['  STRIVE FOR    ', '   EXCELLENCE   ', '  NOT PERFECTION'],
    ['  WHEN YOU HAVE ', '  A GREAT IDEA  ', '  RUN WITH IT   '],
    ['  INNOVATION >  ', '  IMPERFECT  >  ', '   INCOMPLETE   '],
  ];

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  function pad(str, len) {
    const s = String(str).toUpperCase();
    if (s.length >= len) return s.slice(0, len);
    const left = Math.floor((len - s.length) / 2);
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
        back.textContent = char;
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
        const char = padded[r][c];
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
