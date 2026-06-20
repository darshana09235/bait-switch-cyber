const bubbles = Array.from({ length: 14 }, (_, i) => {
  const size = 20 + ((i * 37) % 80);
  const left = (i * 73) % 100;
  const delay = (i * 1.3) % 12;
  const duration = 12 + ((i * 7) % 14);
  return { size, left, delay, duration, id: i };
});

export function Bubbles() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      {bubbles.map((b) => (
        <span
          key={b.id}
          className="absolute rounded-full bg-white/10 backdrop-blur-sm animate-bubble"
          style={{
            width: `${b.size}px`,
            height: `${b.size}px`,
            left: `${b.left}%`,
            bottom: `-${b.size}px`,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
