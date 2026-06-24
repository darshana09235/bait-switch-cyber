// Tiny Web Audio SFX — no asset files needed.
let ctx: AudioContext | null = null;
function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx?.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  startAt = 0,
  gain = 0.18,
) {
  const c = getCtx();
  if (!c) return;
  const t0 = c.currentTime + startAt;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

// Cheerful "ding" — major arpeggio
export function playSafeDing() {
  tone(784, 0.25, "triangle", 0); // G5
  tone(1046, 0.35, "triangle", 0.08); // C6
  tone(1318, 0.5, "triangle", 0.16); // E6
}

// Funny "buzzer" — descending square wave
export function playFakeBuzzer() {
  const c = getCtx();
  if (!c) return;
  const t0 = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(220, t0);
  osc.frequency.linearRampToValueAtTime(110, t0 + 0.45);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(0.12, t0 + 0.02);
  g.gain.linearRampToValueAtTime(0.12, t0 + 0.4);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.5);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + 0.55);
}
