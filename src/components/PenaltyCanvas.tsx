import React, { useEffect, useRef } from 'react';
import { AttemptOutcome, ShotDirection, Team } from '../types/game';

interface PenaltyCanvasProps {
  mode: 'ATTACK_AIM' | 'ATTACK_ANIMATION' | 'GK_ANIMATION' | 'IDLE';
  selectedDirection: ShotDirection | null;
  shotTarget: ShotDirection | null;
  keeperDive: ShotDirection | null;
  outcome: AttemptOutcome | null;
  attackingTeam: Team;
  defendingTeam: Team;
  animationsEnabled: boolean;
  onSelectDirection?: (dir: ShotDirection) => void;
  onConfirmShot?: () => void;
  onAnimationComplete?: () => void;
}

interface Particle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

const PARTICLE_POOL_SIZE = 36;

export const PenaltyCanvas: React.FC<PenaltyCanvasProps> = ({
  mode,
  selectedDirection,
  shotTarget,
  keeperDive,
  outcome,
  attackingTeam,
  defendingTeam,
  animationsEnabled,
  onSelectDirection,
  onConfirmShot,
  onAnimationComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const completeCbRef = useRef(onAnimationComplete);
  completeCbRef.current = onAnimationComplete;

  const propsRef = useRef({
    mode,
    selectedDirection,
    shotTarget,
    keeperDive,
    outcome,
    attackingTeam,
    defendingTeam,
    animationsEnabled,
  });
  propsRef.current = {
    mode,
    selectedDirection,
    shotTarget,
    keeperDive,
    outcome,
    attackingTeam,
    defendingTeam,
    animationsEnabled,
  };

  // Pre-allocated zero-GC particle ring buffer
  const particlesRef = useRef<Particle[]>(
    Array.from({ length: PARTICLE_POOL_SIZE }, () => ({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 1,
      size: 4,
      color: '#10B981',
    }))
  );

  // Keyboard shortcuts during Attack Aim (ArrowLeft / ArrowUp / ArrowRight + Enter)
  useEffect(() => {
    if (mode !== 'ATTACK_AIM') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === '1') {
        e.preventDefault();
        onSelectDirection?.('LEFT');
      } else if (e.key === 'ArrowUp' || e.key === '2') {
        e.preventDefault();
        onSelectDirection?.('CENTER');
      } else if (e.key === 'ArrowRight' || e.key === '3') {
        e.preventDefault();
        onSelectDirection?.('RIGHT');
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (selectedDirection) {
          e.preventDefault();
          onConfirmShot?.();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mode, selectedDirection, onSelectDirection, onConfirmShot]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let lastTime = performance.now();
    let elapsed = 0;
    let hitstopTimer = 0;
    let shakeTrauma = 0;
    let impactTriggered = false;
    let finishedCallbackSent = false;

    const animDuration = propsRef.current.animationsEnabled ? 1.35 : 0.25;

    const spawnBurst = (x: number, y: number, color: string, count: number) => {
      const pool = particlesRef.current;
      let spawned = 0;
      for (let i = 0; i < pool.length && spawned < count; i++) {
        if (!pool[i].active) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 60 + Math.random() * 190;
          pool[i].active = true;
          pool[i].x = x;
          pool[i].y = y;
          pool[i].vx = Math.cos(angle) * speed;
          pool[i].vy = Math.sin(angle) * speed - 60;
          pool[i].life = 0;
          pool[i].maxLife = 0.45 + Math.random() * 0.35;
          pool[i].size = 3 + Math.random() * 4;
          pool[i].color = color;
          spawned++;
        }
      }
    };

    const getDirectionX = (dir: ShotDirection, goalLeft: number, goalWidth: number) => {
      if (dir === 'LEFT') return goalLeft + goalWidth * 0.17;
      if (dir === 'RIGHT') return goalLeft + goalWidth * 0.83;
      return goalLeft + goalWidth * 0.5;
    };

    const render = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(rawDt, 0.05);

      const {
        mode: curMode,
        selectedDirection: curSel,
        shotTarget: curTarget,
        keeperDive: curDive,
        outcome: curOutcome,
        attackingTeam: atkTeam,
        defendingTeam: defTeam,
      } = propsRef.current;

      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(320, Math.round(rect.width));
      const height = Math.max(220, Math.round(rect.height));
      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Advance simulation time respecting brief hitstop
      const isAnimating = curMode === 'ATTACK_ANIMATION' || curMode === 'GK_ANIMATION';
      if (hitstopTimer > 0) {
        hitstopTimer = Math.max(0, hitstopTimer - dt);
      } else if (isAnimating) {
        elapsed += dt;
      } else {
        elapsed += dt;
      }

      // Decay trauma shake
      if (shakeTrauma > 0) {
        shakeTrauma = Math.max(0, shakeTrauma - dt * 2.4);
      }
      const shakeMag = shakeTrauma * shakeTrauma * 9;
      if (shakeMag > 0.1) {
        ctx.translate(
          (Math.random() - 0.5) * shakeMag,
          (Math.random() - 0.5) * shakeMag
        );
      }

      // Geometry
      const goalWidth = Math.min(width * 0.68, 480);
      const goalHeight = Math.min(height * 0.44, 178);
      const goalLeft = (width - goalWidth) / 2;
      const goalTop = height * 0.2;
      const goalBottom = goalTop + goalHeight;
      const spotX = width / 2;
      const spotY = height * 0.84;

      // Subtle turf darkening vignette below goal line for contrast
      const pitchGrad = ctx.createLinearGradient(0, goalBottom - 10, 0, height);
      pitchGrad.addColorStop(0, 'rgba(6, 22, 16, 0.25)');
      pitchGrad.addColorStop(1, 'rgba(4, 15, 11, 0.65)');
      ctx.fillStyle = pitchGrad;
      ctx.fillRect(0, goalBottom - 10, width, height - goalBottom + 10);

      // Goal line
      ctx.strokeStyle = 'rgba(255,255,255,0.65)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, goalBottom);
      ctx.lineTo(width, goalBottom);
      ctx.stroke();

      // Penalty spot
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(spotX, spotY, 7, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Calculate animation timeline (0..1)
      const progress = isAnimating ? Math.min(1, elapsed / animDuration) : 0;
      const runUpT = Math.min(1, progress / 0.28);
      const flightT = progress > 0.28 ? Math.min(1, (progress - 0.28) / 0.44) : 0;
      const postImpactT = progress > 0.72 ? Math.min(1, (progress - 0.72) / 0.28) : 0;

      const isGoalScored =
        curOutcome === 'GOAL' ||
        curOutcome === 'CONCEDED_WRONG_ANSWER' ||
        curOutcome === 'CONCEDED_BEAT_GK';

      // Trigger impact hitstop + particles once at ball arrival
      if (isAnimating && flightT >= 1 && !impactTriggered) {
        impactTriggered = true;
        hitstopTimer = 0.05;
        shakeTrauma = isGoalScored ? 0.85 : 0.55;
        const targetDir = curTarget ?? 'CENTER';
        const ix = getDirectionX(targetDir, goalLeft, goalWidth);
        const iy = goalTop + goalHeight * (targetDir === 'CENTER' ? 0.32 : 0.42);
        const burstColor =
          curOutcome === 'GOAL' || curOutcome === 'SAVE' ? '#10B981' : '#EF4444';
        spawnBurst(ix, iy, burstColor, 20);
        if (curOutcome === 'GOAL') {
          spawnBurst(ix, iy, '#EAB308', 12);
        }
      }

      if (isAnimating && progress >= 1 && !finishedCallbackSent) {
        finishedCallbackSent = true;
        completeCbRef.current?.();
      }

      // Draw goal net with subtle ripple on goal impact
      const netRipple =
        isAnimating && isGoalScored && postImpactT > 0
          ? Math.sin(postImpactT * Math.PI * 4) * (1 - postImpactT) * 7
          : 0;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.42)';
      ctx.fillRect(goalLeft, goalTop, goalWidth, goalHeight);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.lineWidth = 1;
      const cols = 16;
      const rows = 7;
      for (let c = 1; c < cols; c++) {
        const x = goalLeft + (goalWidth / cols) * c;
        ctx.beginPath();
        ctx.moveTo(x, goalTop);
        ctx.quadraticCurveTo(x + netRipple, goalTop + goalHeight * 0.5, x, goalBottom);
        ctx.stroke();
      }
      for (let r = 1; r < rows; r++) {
        const y = goalTop + (goalHeight / rows) * r;
        ctx.beginPath();
        ctx.moveTo(goalLeft, y);
        ctx.quadraticCurveTo(goalLeft + goalWidth * 0.5, y + netRipple, goalLeft + goalWidth, y);
        ctx.stroke();
      }

      // Goalposts & Crossbar
      ctx.strokeStyle = '#F8FAFC';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(goalLeft, goalBottom);
      ctx.lineTo(goalLeft, goalTop);
      ctx.lineTo(goalLeft + goalWidth, goalTop);
      ctx.lineTo(goalLeft + goalWidth, goalBottom);
      ctx.stroke();

      // Aim target overlays when in ATTACK_AIM mode
      if (curMode === 'ATTACK_AIM') {
        const zones: Array<{ dir: ShotDirection; label: string; yRatio: number }> = [
          { dir: 'LEFT', label: 'LEFT', yRatio: 0.36 },
          { dir: 'CENTER', label: 'CENTER', yRatio: 0.24 },
          { dir: 'RIGHT', label: 'RIGHT', yRatio: 0.36 },
        ];
        const pulse = 0.5 + 0.5 * Math.sin(elapsed * 4.5);
        for (const z of zones) {
          const zx = getDirectionX(z.dir, goalLeft, goalWidth);
          const zy = goalTop + goalHeight * z.yRatio;
          const isPicked = curSel === z.dir;

          ctx.save();
          ctx.beginPath();
          ctx.arc(zx, zy, isPicked ? 27 + pulse * 3 : 22, 0, Math.PI * 2);
          ctx.fillStyle = isPicked
            ? 'rgba(16, 185, 129, 0.42)'
            : 'rgba(15, 23, 42, 0.62)';
          ctx.fill();
          ctx.lineWidth = isPicked ? 3.5 : 1.75;
          ctx.strokeStyle = isPicked ? '#34D399' : 'rgba(255,255,255,0.65)';
          ctx.stroke();

          ctx.fillStyle = '#FFFFFF';
          ctx.font = '700 11px "Barlow Condensed", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(z.label, zx, zy);
          ctx.restore();
        }
      }

      // Draw Goalkeeper
      const gkBaseX = width / 2;
      const gkBaseY = goalBottom - 8;
      let gkX = gkBaseX;
      let gkY = gkBaseY;
      let gkTilt = 0;

      if (isAnimating && curDive && flightT > 0) {
        const diveEase = 1 - Math.pow(1 - flightT, 3);
        const diveOffset =
          curDive === 'LEFT'
            ? -goalWidth * 0.31
            : curDive === 'RIGHT'
              ? goalWidth * 0.31
              : 0;
        gkX = gkBaseX + diveOffset * diveEase;
        gkY = gkBaseY - (curDive === 'CENTER' ? 14 * diveEase : 20 * Math.sin(diveEase * Math.PI * 0.8));
        gkTilt = curDive === 'LEFT' ? -0.95 * diveEase : curDive === 'RIGHT' ? 0.95 * diveEase : 0;
      } else {
        // Subtle goalkeeper ready bounce
        gkY = gkBaseY + Math.sin(elapsed * 5) * 2.5;
      }

      ctx.save();
      ctx.translate(gkX, gkY);
      ctx.rotate(gkTilt);

      // Keeper shadow
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(0, 6, 18, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Keeper legs
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(-7, -18);
      ctx.lineTo(-10, 4);
      ctx.moveTo(7, -18);
      ctx.lineTo(10, 4);
      ctx.stroke();

      // Distinct goalkeeper jersey that never clashes with the attacking striker kit
      const atkUpper = atkTeam.primaryColor.toUpperCase();
      const gkColor =
        atkUpper === '#38BDF8' || atkUpper === '#2563EB' || atkUpper === '#1D4ED8'
          ? '#F97316' // Vibrant goalkeeper orange vs blue kits
          : '#06B6D4'; // Distinct goalkeeper cyan vs red/yellow/white/dark kits
      ctx.fillStyle = gkColor;
      ctx.beginPath();
      ctx.roundRect(-13, -44, 26, 28, 6);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Outstretched arms & bright gloves
      const armSpread = isAnimating && flightT > 0 ? 34 : 24;
      const armLift = isAnimating && flightT > 0 ? -52 : -34;
      ctx.strokeStyle = gkColor;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(-12, -38);
      ctx.lineTo(-armSpread, armLift);
      ctx.moveTo(12, -38);
      ctx.lineTo(armSpread, armLift);
      ctx.stroke();

      // Gloves
      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.arc(-armSpread, armLift, 5.5, 0, Math.PI * 2);
      ctx.arc(armSpread, armLift, 5.5, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.fillStyle = '#FDBA74';
      ctx.beginPath();
      ctx.arc(0, -52, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Draw Striker silhouette approaching the penalty spot (on Attack animations or Aim)
      if (curMode === 'ATTACK_AIM' || curMode === 'ATTACK_ANIMATION') {
        const startX = spotX - 42;
        const startY = spotY + 26;
        const strikerX = startX + (spotX - 16 - startX) * runUpT;
        const strikerY = startY + (spotY + 6 - startY) * runUpT;
        const stride = isAnimating && runUpT < 1 ? Math.sin(runUpT * Math.PI * 5) * 4 : 0;

        ctx.save();
        ctx.translate(strikerX, strikerY + stride * 0.4);
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(0, 8, 16, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = atkTeam.primaryColor;
        ctx.beginPath();
        ctx.roundRect(-11, -38, 22, 26, 6);
        ctx.fill();
        ctx.strokeStyle = atkTeam.secondaryColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#FDBA74';
        ctx.beginPath();
        ctx.arc(0, -47, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw Football
      let ballX = spotX;
      let ballY = spotY - 5;
      let ballRadius = 11;

      if (isAnimating && curTarget && flightT > 0) {
        const ease = 1 - Math.pow(1 - flightT, 2.2);
        const destX = getDirectionX(curTarget, goalLeft, goalWidth);
        const destY = goalTop + goalHeight * (curTarget === 'CENTER' ? 0.24 : 0.36);
        const arcHeight = 46 * Math.sin(flightT * Math.PI);

        ballX = spotX + (destX - spotX) * ease;
        ballY = spotY - 5 + (destY - (spotY - 5)) * ease - arcHeight;
        ballRadius = 11 - 4.2 * ease;

        // Post-impact bounce if saved or missed
        if (postImpactT > 0 && !isGoalScored) {
          const deflectDir = curTarget === 'RIGHT' ? 1 : -1;
          ballX += deflectDir * postImpactT * 58;
          ballY += postImpactT * 34;
        }
      }

      // Ball shadow
      ctx.fillStyle = 'rgba(0,0,0,0.42)';
      ctx.beginPath();
      ctx.ellipse(ballX, Math.min(spotY + 2, ballY + 12), ballRadius * 0.9, ballRadius * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();

      // Ball body
      ctx.save();
      ctx.translate(ballX, ballY);
      ctx.rotate(flightT * 12);
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, ballRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 1.4;
      ctx.stroke();
      // Pentagon core
      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        const r = ballRadius * 0.45;
        if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Update & draw pooled particles
      const pool = particlesRef.current;
      for (let i = 0; i < pool.length; i++) {
        const p = pool[i];
        if (!p.active) continue;
        p.life += dt;
        if (p.life >= p.maxLife) {
          p.active = false;
          continue;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 320 * dt;
        const alpha = 1 - p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
      ctx.globalAlpha = 1;
      ctx.restore();

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [mode, shotTarget, keeperDive, outcome]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode !== 'ATTACK_AIM' || !onSelectDirection) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    if (relX < 0.38) onSelectDirection('LEFT');
    else if (relX > 0.62) onSelectDirection('RIGHT');
    else onSelectDirection('CENTER');
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/12 bg-[#091221]">
      {/* Generated stadium penalty backdrop */}
      <img
        src="/src/assets/images/penalty_pitch_bg_1795091151333.jpg"
        alt="Stadium penalty pitch view"
        referrerPolicy="no-referrer"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-55"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#080E1A]/55 via-transparent to-[#080E1A]/75" />

      {/* Isolated 2D Canvas */}
      <div className="relative h-[280px] sm:h-[340px] w-full">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          data-testid="penalty-canvas"
          className={`block h-full w-full ${mode === 'ATTACK_AIM' ? 'cursor-crosshair' : ''}`}
        />
      </div>

      {/* Explicit Manual Direction Controls for Attack Mode */}
      {mode === 'ATTACK_AIM' && (
        <div className="relative z-10 border-t border-white/10 bg-[#0B1424]/95 px-4 py-4">
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs font-semibold text-emerald-300">
              Vocabulary correct — Choose your penalty direction and confirm shot
            </p>
            <div className="grid w-full max-w-md grid-cols-3 gap-2.5">
              {(['LEFT', 'CENTER', 'RIGHT'] as ShotDirection[]).map((dir) => {
                const active = selectedDirection === dir;
                return (
                  <button
                    key={dir}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onSelectDirection?.(dir)}
                    className={`min-h-[46px] rounded-lg border px-3 py-2 text-sm font-bold tracking-wide ${
                      active
                        ? 'border-emerald-300 bg-emerald-500 text-slate-950'
                        : 'border-white/15 bg-[#121F38] text-white hover:border-emerald-400/60'
                    }`}
                  >
                    {dir}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={!selectedDirection}
              onClick={() => onConfirmShot?.()}
              className={`min-h-[48px] w-full max-w-md rounded-lg px-6 py-3 text-sm font-extrabold tracking-wide ${
                selectedDirection
                  ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                  : 'cursor-not-allowed bg-slate-800 text-slate-500'
              }`}
            >
              {selectedDirection ? `Shoot ${selectedDirection}` : 'Select Direction to Shoot'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
