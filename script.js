(() => {
  'use strict';

  const CONFIG = {
    WORLD_W: 1000,
    WORLD_H: 560,
    GROUND_Y: 470,
    PLAYER_X: 170,
    PLAYER_W: 70,
    PLAYER_H: 78,
    DODGE_H: 42,
    GRAVITY: 3200,
    JUMP_SPEED: 1120,
    DODGE_TIME: 0.7,
    DODGE_MAX_TIME: 1.25,
    BASE_SPEED: 300,
    MAX_SPEED: 620,
    SPEED_RAMP: 2.4,
    FIRST_OBSTACLE_DELAY: 1.6,
    GAP_START: 1.55,
    GAP_MIN: 0.85,
    RAMP_TIME: 100,
    UNITS_PER_METER: 40,
    CLEAR_BONUS: 10,
    FORGIVE_X: 6,
    FORGIVE_Y: 6,
    FAR_SPEED_FACTOR: 0.42,
    MAX_FRAME: 0.05,
    BEST_KEY: 'running-goat.best.v1',
    MUTE_KEY: 'running-goat.muted.v1'
  };

  const STATE = Object.freeze({
    START: 'START',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    GAME_OVER: 'GAME_OVER'
  });

  const BADGE = {
    [STATE.START]: { icon: '●', text: 'READY' },
    [STATE.PLAYING]: { icon: '▶', text: 'RUNNING' },
    [STATE.PAUSED]: { icon: '⏸', text: 'PAUSED' },
    [STATE.GAME_OVER]: { icon: '■', text: 'GAME OVER' }
  };

  const OBSTACLE_TYPES = {
    rock: {
      need: 'jump',
      unlock: 0,
      w: 76,
      h: 46,
      hint: '↑ JUMP',
      svg: `<svg viewBox="0 0 76 46"><path d="M3 46 L12 21 L31 0 L55 5 L71 23 L75 46 Z" fill="#9aa5b1"/><path d="M12 21 L31 0 L55 5 L44 19 Z" fill="#c3ccd5"/><path d="M3 46 L12 21 L24 33 Z" fill="#7d8792"/><circle cx="34" cy="34" r="3.4" fill="#7d8792"/><circle cx="54" cy="32" r="2.6" fill="#7d8792"/><circle cx="63" cy="41" r="2.2" fill="#7d8792"/><circle cx="20" cy="38" r="2" fill="#7d8792"/></svg>`
    },
    log: {
      need: 'jump',
      unlock: 8,
      w: 118,
      h: 58,
      hint: '↑ JUMP',
      svg: `<svg viewBox="0 0 118 58"><rect x="2" y="0" width="114" height="58" rx="29" fill="#a16207"/><rect x="14" y="7" width="82" height="10" rx="5" fill="#ca8a04"/><path d="M28 1 q15 -1 28 1 q-14 7 -28 -1 z" fill="#4d7c0f"/><path d="M62 3 q12 0 20 2 q-11 5 -20 -2 z" fill="#3f6212"/><ellipse cx="102" cy="29" rx="14" ry="29" fill="#b45309"/><ellipse cx="102" cy="29" rx="7" ry="12" fill="#fcd34d"/><ellipse cx="102" cy="29" rx="3" ry="5" fill="#d97706"/></svg>`
    },
    bush: {
      need: 'jump',
      unlock: 20,
      w: 96,
      h: 68,
      hint: '↑ JUMP',
      svg: `<svg viewBox="0 0 96 68"><rect x="4" y="56" width="88" height="12" rx="6" fill="#2f7d32"/><ellipse cx="30" cy="30" rx="26" ry="30" fill="#3f9142"/><ellipse cx="62" cy="22" rx="28" ry="22" fill="#4caf50"/><ellipse cx="70" cy="48" rx="26" ry="20" fill="#3f9142"/><ellipse cx="40" cy="20" rx="13" ry="10" fill="#66bb6a"/><ellipse cx="80" cy="36" rx="11" ry="9" fill="#66bb6a"/><circle cx="38" cy="40" r="4" fill="#ef4444"/><circle cx="66" cy="46" r="4" fill="#ef4444"/><circle cx="24" cy="54" r="3.4" fill="#ef4444"/><circle cx="56" cy="26" r="3.4" fill="#fde047"/></svg>`
    },
    hurdle: {
      need: 'jump',
      unlock: 34,
      w: 88,
      h: 78,
      hint: '↑ JUMP',
      svg: `<svg viewBox="0 0 88 78"><rect x="8" y="0" width="11" height="78" rx="5.5" fill="#92400e"/><rect x="69" y="0" width="11" height="78" rx="5.5" fill="#92400e"/><rect x="0" y="24" width="88" height="11" rx="5.5" fill="#b45309"/><rect x="0" y="50" width="88" height="11" rx="5.5" fill="#b45309"/><circle cx="13" cy="29.5" r="2.2" fill="#fcd34d"/><circle cx="75" cy="55.5" r="2.2" fill="#fcd34d"/></svg>`
    },
    branch: {
      need: 'dodge',
      unlock: 26,
      w: 132,
      h: 240,
      top: 176,
      hint: '↓ DODGE',
      svg: `<svg viewBox="0 0 132 240"><rect x="32" y="0" width="4" height="42" fill="#92400e"/><rect x="96" y="0" width="4" height="42" fill="#92400e"/><ellipse cx="66" cy="66" rx="62" ry="46" fill="#43a047"/><ellipse cx="66" cy="104" rx="58" ry="40" fill="#4caf50"/><ellipse cx="66" cy="142" rx="52" ry="34" fill="#43a047"/><ellipse cx="66" cy="176" rx="44" ry="26" fill="#4caf50"/><ellipse cx="40" cy="84" rx="18" ry="14" fill="#66bb6a"/><ellipse cx="96" cy="120" rx="16" ry="13" fill="#66bb6a"/><ellipse cx="72" cy="164" rx="14" ry="11" fill="#66bb6a"/><circle cx="38" cy="122" r="4.5" fill="#f472b6"/><circle cx="94" cy="96" r="4.5" fill="#fde047"/><circle cx="62" cy="152" r="4.5" fill="#f472b6"/><circle cx="88" cy="170" r="4" fill="#fde047"/><rect x="0" y="194" width="132" height="46" rx="16" fill="#92400e"/><rect x="8" y="203" width="116" height="10" rx="5" fill="#b45309"/><rect x="30" y="221" width="72" height="19" rx="9" fill="#a16207"/></svg>`
    }
  };

  const $ = (id) => document.getElementById(id);

  const el = {
    stage: $('stage'),
    world: $('world'),
    goat: $('goat'),
    ground: $('ground'),
    far: $('farLayer'),
    obstacles: $('obstacleLayer'),
    floaters: $('floaters'),
    hint: $('hint'),
    score: $('statScore'),
    meters: $('statMeters'),
    best: $('statBest'),
    startBest: $('startBest'),
    badgeIcon: $('stateBadgeIcon'),
    badgeText: $('stateBadgeText'),
    overScore: $('overScore'),
    overBest: $('overBest'),
    overMeters: $('overMeters'),
    newBest: $('newBestBadge'),
    announcer: $('announcer'),
    overlayStart: $('overlayStart'),
    overlayPause: $('overlayPause'),
    overlayOver: $('overlayOver')
  };

  const btn = {
    start: $('btnStart'),
    playAgain: $('btnPlayAgain'),
    pause: $('btnPause'),
    resume: $('btnResume'),
    restart: $('btnRestart'),
    mute: $('btnMute'),
    muteIcon: $('btnMuteIcon'),
    muteText: $('btnMuteText'),
    jump: $('btnJump'),
    dodge: $('btnDodge')
  };

  const Sound = (() => {
    let ctx = null;
    let muted = readFlag(CONFIG.MUTE_KEY, false);

    function readFlag(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : raw === 'true';
      } catch {
        return fallback;
      }
    }

    function unlock() {
      if (muted) return;
      try {
        if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === 'suspended') ctx.resume();
      } catch {
        ctx = null;
      }
    }

    function tone(freq, endFreq, duration, type, peak) {
      if (muted || !ctx) return;
      const t0 = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      if (endFreq !== freq) osc.frequency.exponentialRampToValueAtTime(endFreq, t0 + duration);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + duration + 0.02);
    }

    function play(name) {
      if (muted || !ctx) return;
      switch (name) {
        case 'jump':
          tone(420, 700, 0.14, 'sine', 0.18);
          break;
        case 'dodge':
          tone(560, 190, 0.2, 'triangle', 0.15);
          break;
        case 'clear':
          tone(880, 1320, 0.12, 'sine', 0.14);
          break;
        case 'start':
          tone(523, 523, 0.1, 'triangle', 0.16);
          window.setTimeout(() => tone(784, 784, 0.12, 'triangle', 0.16), 90);
          break;
        case 'over':
          tone(330, 140, 0.5, 'sawtooth', 0.13);
          break;
        default:
          break;
      }
    }

    function toggle() {
      muted = !muted;
      try {
        localStorage.setItem(CONFIG.MUTE_KEY, String(muted));
      } catch {
        /* storage unavailable */
      }
      if (!muted) unlock();
      return muted;
    }

    return { unlock, play, toggle, get muted() { return muted; } };
  })();

  const game = {
    state: STATE.START,
    elapsed: 0,
    distance: 0,
    speed: CONFIG.BASE_SPEED,
    bonus: 0,
    best: 0,
    nextSpawnX: 0,
    groundOffset: 0,
    farOffset: 0,
    obstacles: [],
    pools: new Map(),
    seenTypes: new Set(),
    hintTimer: 0,
    rafId: 0,
    lastTime: 0,
    display: { score: -1, meters: -1, best: -1 }
  };

  const player = {
    y: 0,
    vy: 0,
    jumping: false,
    dodging: false,
    dodgeLeft: 0,
    dodgingFor: 0
  };

  function readBest() {
    try {
      const raw = localStorage.getItem(CONFIG.BEST_KEY);
      const value = Number.parseInt(raw, 10);
      return Number.isFinite(value) && value > 0 ? value : 0;
    } catch {
      return 0;
    }
  }

  function writeBest(value) {
    try {
      localStorage.setItem(CONFIG.BEST_KEY, String(value));
    } catch {
      /* storage unavailable */
    }
  }

  /* ---------------- obstacle pool ---------------- */

  function acquireObstacle(kind) {
    const type = OBSTACLE_TYPES[kind];
    let pool = game.pools.get(kind);
    if (!pool) {
      pool = [];
      game.pools.set(kind, pool);
    }
    let node = pool.pop();
    if (!node) {
      node = document.createElement('div');
      node.className = 'obstacle';
      node.dataset.kind = kind;
      node.style.width = `${type.w}px`;
      node.style.height = `${type.h}px`;
      node.style.top = `${type.top ?? CONFIG.GROUND_Y - type.h}px`;
      node.innerHTML = type.svg;
    }
    el.obstacles.appendChild(node);
    return node;
  }

  function releaseObstacle(node) {
    node.remove();
    const kind = node.dataset.kind;
    game.pools.get(kind).push(node);
  }

  function clearObstacles() {
    while (game.obstacles.length) releaseObstacle(game.obstacles.pop().node);
  }

  /* ---------------- spawning ---------------- */

  function availableTypes() {
    const kinds = [];
    for (const kind in OBSTACLE_TYPES) {
      if (game.elapsed >= OBSTACLE_TYPES[kind].unlock) kinds.push(kind);
    }
    return kinds;
  }

  function gapSeconds() {
    const t = Math.min(game.elapsed / CONFIG.RAMP_TIME, 1);
    return CONFIG.GAP_START - (CONFIG.GAP_START - CONFIG.GAP_MIN) * t;
  }

  function spawnObstacle() {
    const kinds = availableTypes();
    const kind = kinds[Math.floor(Math.random() * kinds.length)];
    const type = OBSTACLE_TYPES[kind];
    const node = acquireObstacle(kind);
    const obstacle = {
      node,
      kind,
      need: type.need,
      w: type.w,
      h: type.h,
      top: type.top ?? CONFIG.GROUND_Y - type.h,
      x: game.nextSpawnX,
      scored: false
    };
    game.obstacles.push(obstacle);
    placeObstacle(obstacle);
    game.nextSpawnX += type.w + game.speed * gapSeconds();

    if (!game.seenTypes.has(kind)) {
      game.seenTypes.add(kind);
      showHint(type.hint);
    }
  }

  function placeObstacle(obstacle) {
    obstacle.node.style.transform = `translate3d(${obstacle.x}px, 0, 0)`;
  }

  function showHint(text) {
    window.clearTimeout(game.hintTimer);
    el.hint.textContent = text;
    el.hint.hidden = false;
    el.hint.style.animation = 'none';
    void el.hint.offsetWidth;
    el.hint.style.animation = '';
    game.hintTimer = window.setTimeout(() => {
      el.hint.hidden = true;
    }, 1500);
  }

  /* ---------------- bonus floaters ---------------- */

  const floaters = [];

  function showBonus() {
    let floater = floaters.find((node) => node.dataset.busy !== 'true');
    if (!floater) {
      if (floaters.length >= 4) return;
      floater = document.createElement('span');
      floater.className = 'floater';
      floater.dataset.busy = 'false';
      floater.addEventListener('animationend', () => {
        floater.dataset.busy = 'false';
        floater.classList.remove('is-on');
      });
      floaters.push(floater);
      el.floaters.appendChild(floater);
    }
    floater.textContent = `+${CONFIG.CLEAR_BONUS}`;
    floater.dataset.busy = 'true';
    floater.classList.remove('is-on');
    void floater.offsetWidth;
    floater.classList.add('is-on');
  }

  /* ---------------- collision ---------------- */

  function playerBox() {
    const height = player.dodging ? CONFIG.DODGE_H : CONFIG.PLAYER_H;
    return {
      x: CONFIG.PLAYER_X,
      y: CONFIG.GROUND_Y - height - player.y,
      w: CONFIG.PLAYER_W,
      h: height
    };
  }

  function isHit(a, b) {
    const fx = CONFIG.FORGIVE_X;
    const fy = CONFIG.FORGIVE_Y;
    return (
      a.x + a.w - fx > b.x + fx &&
      b.x + b.w - fx > a.x + fx &&
      a.y + a.h - fy > b.y + fy &&
      b.y + b.h - fy > a.y + fy
    );
  }

  function checkCollisions(box) {
    for (const obstacle of game.obstacles) {
      if (
        isHit(box, {
          x: obstacle.x,
          y: obstacle.top,
          w: obstacle.w,
          h: obstacle.h
        })
      ) {
        return obstacle;
      }
    }
    return null;
  }

  function keepDodgeAlive() {
    if (!player.dodging || player.dodgingFor >= CONFIG.DODGE_MAX_TIME) return;
    const box = playerBox();
    for (const obstacle of game.obstacles) {
      if (obstacle.need !== 'dodge') continue;
      if (obstacle.x < box.x + box.w && obstacle.x + obstacle.w > box.x) {
        player.dodgeLeft = CONFIG.DODGE_TIME;
        return;
      }
    }
  }

  /* ---------------- player actions ---------------- */

  function jump() {
    if (game.state !== STATE.PLAYING || player.jumping || player.dodging) return;
    player.jumping = true;
    player.vy = CONFIG.JUMP_SPEED;
    setPose('jump');
    Sound.play('jump');
  }

  function dodge() {
    if (game.state !== STATE.PLAYING || player.dodging || player.jumping) return;
    player.dodging = true;
    player.dodgingFor = 0;
    player.dodgeLeft = CONFIG.DODGE_TIME;
    setPose('dodge');
    Sound.play('dodge');
  }

  function setPose(pose) {
    if (el.goat.dataset.pose !== pose) el.goat.dataset.pose = pose;
  }

  /* ---------------- simulation ---------------- */

  function currentSpeed() {
    return CONFIG.BASE_SPEED + Math.min(game.elapsed * CONFIG.SPEED_RAMP, CONFIG.MAX_SPEED - CONFIG.BASE_SPEED);
  }

  function resetRun() {
    game.elapsed = 0;
    game.distance = 0;
    game.bonus = 0;
    game.speed = CONFIG.BASE_SPEED;
    game.groundOffset = 0;
    game.farOffset = 0;
    game.seenTypes.clear();
    player.y = 0;
    player.vy = 0;
    player.jumping = false;
    player.dodging = false;
    player.dodgeLeft = 0;
    player.dodgingFor = 0;
    window.clearTimeout(game.hintTimer);
    el.hint.hidden = true;
    el.goat.style.transform = 'translate3d(0, 0, 0)';
    clearObstacles();
    game.nextSpawnX = CONFIG.WORLD_W + 40 + game.speed * CONFIG.FIRST_OBSTACLE_DELAY;
    game.display = { score: -1, meters: -1, best: -1 };
    updateHud();
  }

  function startGame() {
    resetRun();
    setState(STATE.PLAYING);
    Sound.play('start');
    startLoop();
  }

  function updatePlayer(dt) {
    keepDodgeAlive();

    if (player.jumping) {
      player.vy -= CONFIG.GRAVITY * dt;
      player.y += player.vy * dt;
      if (player.y <= 0) {
        player.y = 0;
        player.vy = 0;
        player.jumping = false;
      }
    }

    if (player.dodging) {
      player.dodgingFor += dt;
      player.dodgeLeft -= dt;
      if (player.dodgeLeft <= 0) {
        player.dodging = false;
        player.dodgingFor = 0;
      }
    }

    el.goat.style.transform = `translate3d(0, ${-player.y}px, 0)`;

    if (player.dodging) setPose('dodge');
    else if (player.jumping) setPose('jump');
    else setPose('run');
  }

  function updateObstacles(dt) {
    game.nextSpawnX -= game.speed * dt;
    if (game.nextSpawnX <= CONFIG.WORLD_W + 20) spawnObstacle();

    for (let i = game.obstacles.length - 1; i >= 0; i--) {
      const obstacle = game.obstacles[i];
      obstacle.x -= game.speed * dt;
      placeObstacle(obstacle);

      if (!obstacle.scored && obstacle.x + obstacle.w < CONFIG.PLAYER_X) {
        obstacle.scored = true;
        game.bonus += CONFIG.CLEAR_BONUS;
        showBonus();
        Sound.play('clear');
      }

      if (obstacle.x + obstacle.w < -30) {
        releaseObstacle(obstacle.node);
        game.obstacles.splice(i, 1);
      }
    }

    if (checkCollisions(playerBox())) endRun();
  }

  function updateScore(dt) {
    game.elapsed += dt;
    game.distance += game.speed * dt;
    game.speed = currentSpeed();
    game.groundOffset = (game.groundOffset + game.speed * dt) % 200;
    game.farOffset = (game.farOffset + game.speed * dt * CONFIG.FAR_SPEED_FACTOR) % 300;
    el.ground.style.backgroundPositionX = `${-game.groundOffset}px`;
    el.far.style.backgroundPositionX = `${-game.farOffset}px`;
    updateHud();
  }

  function meters() {
    return Math.floor(game.distance / CONFIG.UNITS_PER_METER);
  }

  function score() {
    return meters() + game.bonus;
  }

  function updateHud() {
    const current = score();
    if (current !== game.display.score) {
      game.display.score = current;
      el.score.textContent = String(current);
    }
    const metres = meters();
    if (metres !== game.display.meters) {
      game.display.meters = metres;
      el.meters.textContent = String(metres);
    }
    const shownBest = Math.max(game.best, current);
    if (shownBest !== game.display.best) {
      game.display.best = shownBest;
      el.best.textContent = String(shownBest);
      el.startBest.textContent = String(game.best);
    }
  }

  /* ---------------- state machine ---------------- */

  function setState(next) {
    game.state = next;
    const badge = BADGE[next];
    el.badgeIcon.textContent = badge.icon;
    el.badgeText.textContent = badge.text;
    el.overlayStart.hidden = next !== STATE.START;
    el.overlayPause.hidden = next !== STATE.PAUSED;
    el.overlayOver.hidden = next !== STATE.GAME_OVER;
    btn.pause.disabled = next !== STATE.PLAYING && next !== STATE.PAUSED;
    btn.pause.setAttribute('aria-label', next === STATE.PAUSED ? 'Resume the game' : 'Pause the game');
    el.stage.classList.toggle('is-hit', next === STATE.GAME_OVER);

    if (next === STATE.START) btn.start.focus();
    if (next === STATE.PAUSED) btn.resume.focus();
    if (next === STATE.GAME_OVER) btn.playAgain.focus();
  }

  function endRun() {
    stopLoop();
    const finalScore = score();
    const isBest = finalScore > game.best;
    if (isBest) {
      game.best = finalScore;
      writeBest(finalScore);
    }
    el.overScore.textContent = String(finalScore);
    el.overBest.textContent = String(game.best);
    el.overMeters.textContent = String(meters());
    el.newBest.hidden = !isBest;
    setPose('over');
    Sound.play('over');
    announce(`Game over. Your score ${finalScore}. Best score ${game.best}. Distance ${meters()} metres.`);
    setState(STATE.GAME_OVER);
    updateHud();
  }

  function togglePause() {
    if (game.state === STATE.PLAYING) {
      stopLoop();
      setState(STATE.PAUSED);
      announce('Paused.');
    } else if (game.state === STATE.PAUSED) {
      setState(STATE.PLAYING);
      startLoop();
      announce('Running.');
    }
  }

  function announce(message) {
    el.announcer.textContent = message;
  }

  /* ---------------- loop ---------------- */

  function frame(time) {
    game.rafId = 0;
    if (game.state !== STATE.PLAYING) return;
    const dt = game.lastTime ? Math.min((time - game.lastTime) / 1000, CONFIG.MAX_FRAME) : 0;
    game.lastTime = time;
    updatePlayer(dt);
    updateObstacles(dt);
    if (game.state === STATE.PLAYING) updateScore(dt);
    if (game.state === STATE.PLAYING) game.rafId = requestAnimationFrame(frame);
  }

  function startLoop() {
    if (game.rafId) return;
    game.lastTime = 0;
    game.rafId = requestAnimationFrame(frame);
  }

  function stopLoop() {
    if (game.rafId) cancelAnimationFrame(game.rafId);
    game.rafId = 0;
    game.lastTime = 0;
  }

  /* ---------------- input ---------------- */

  const KEY_ACTIONS = new Map([
    ['Space', 'jump'],
    ['ArrowUp', 'jump'],
    ['KeyW', 'jump'],
    ['ArrowDown', 'dodge'],
    ['KeyS', 'dodge'],
    ['Escape', 'pause'],
    ['KeyP', 'pause']
  ]);

  const BLOCKED_KEYS = new Set([
    'Space',
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'PageUp',
    'PageDown',
    'Home',
    'End'
  ]);

  function perform(action) {
    Sound.unlock();
    if (action === 'jump') jump();
    else if (action === 'dodge') dodge();
    else if (action === 'pause') togglePause();
  }

  function onKeyDown(event) {
    if (event.repeat) return;
    const target = event.target;
    const onControl =
      target instanceof Element && target.closest('button, a[href], input, select, textarea');
    if (onControl && (event.code === 'Space' || event.code === 'Enter')) return;

    const action = KEY_ACTIONS.get(event.code);
    if (!action) return;
    if (BLOCKED_KEYS.has(event.code) || action === 'pause') event.preventDefault();

    if (action === 'jump' || action === 'dodge') {
      if (game.state === STATE.PLAYING) perform(action);
      else if (game.state === STATE.START && action === 'jump') startGame();
      return;
    }
    perform('pause');
  }

  function onPointerDown(event, action) {
    event.preventDefault();
    Sound.unlock();
    if (action === 'tap') {
      if (game.state === STATE.PLAYING) jump();
      return;
    }
    perform(action);
  }

  function bindInput() {
    window.addEventListener('keydown', onKeyDown);

    el.stage.addEventListener('pointerdown', (event) => onPointerDown(event, 'tap'));

    btn.jump.addEventListener('pointerdown', (event) => onPointerDown(event, 'jump'));
    btn.dodge.addEventListener('pointerdown', (event) => onPointerDown(event, 'dodge'));
    btn.jump.addEventListener('keydown', (event) => {
      if (event.code === 'Space' || event.code === 'Enter') onPointerDown(event, 'jump');
    });
    btn.dodge.addEventListener('keydown', (event) => {
      if (event.code === 'Space' || event.code === 'Enter') onPointerDown(event, 'dodge');
    });

    btn.start.addEventListener('click', () => {
      Sound.unlock();
      startGame();
    });
    btn.playAgain.addEventListener('click', () => {
      Sound.unlock();
      startGame();
    });
    btn.pause.addEventListener('click', () => perform('pause'));
    btn.resume.addEventListener('click', () => perform('pause'));
    btn.restart.addEventListener('click', () => startGame());
    btn.mute.addEventListener('click', () => {
      const muted = Sound.toggle();
      btn.muteIcon.textContent = muted ? '🔇' : '🔊';
      btn.muteText.textContent = muted ? 'Muted' : 'Sound';
      btn.mute.setAttribute('aria-pressed', String(muted));
      btn.mute.setAttribute('aria-label', muted ? 'Unmute sound' : 'Mute sound');
      if (!muted) Sound.play('clear');
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && game.state === STATE.PLAYING) togglePause();
    });
  }

  /* ---------------- layout ---------------- */

  function resizeWorld() {
    const rect = el.stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const scale = Math.min(rect.width / CONFIG.WORLD_W, rect.height / CONFIG.WORLD_H);
    el.world.style.transform = `scale(${scale})`;
  }

  function observeResize() {
    if (typeof ResizeObserver === 'function') {
      new ResizeObserver(resizeWorld).observe(el.stage);
    }
    window.addEventListener('resize', resizeWorld);
    window.addEventListener('orientationchange', resizeWorld);
  }

  /* ---------------- boot ---------------- */

  function init() {
    game.best = readBest();
    btn.muteIcon.textContent = Sound.muted ? '🔇' : '🔊';
    btn.muteText.textContent = Sound.muted ? 'Muted' : 'Sound';
    btn.mute.setAttribute('aria-pressed', String(Sound.muted));
    btn.mute.setAttribute('aria-label', Sound.muted ? 'Unmute sound' : 'Mute sound');

    bindInput();
    observeResize();
    resetRun();
    setPose('idle');
    resizeWorld();
    setState(STATE.START);
    announce('Running Goat. Press start game, then jump or dodge to keep the goat running.');
  }

  init();
})();