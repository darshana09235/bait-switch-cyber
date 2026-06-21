import type { AgeBucket } from "@/lib/game-types";
import { AGE_BUCKETS } from "@/data/scenarios";

type Props = {
  value: AgeBucket[];
  onChange: (next: AgeBucket[]) => void;
};

export function AgeGroupPicker({ value, onChange }: Props) {
  const toggle = (id: AgeBucket) => {
    if (value.includes(id)) onChange(value.filter((b) => b !== id));
    else onChange([...value, id]);
  };

  return (
    <div className="rounded-3xl bg-white/10 p-6 backdrop-blur">
      <div className="mb-3 flex items-center justify-between gap-4">
        <label className="font-bold text-white">Age groups</label>
        <div className="text-xs text-white/60">Pick one or more</div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {AGE_BUCKETS.map((b) => {
          const active = value.includes(b.id);
          return (
            <button
              key={b.id}
              onClick={() => toggle(b.id)}
              className={`rounded-2xl p-4 text-left transition-all ${
                active
                  ? "bg-sand text-slate-900 scale-105 shadow-xl ring-4 ring-sand/40"
                  : "bg-white/15 text-white hover:bg-white/25"
              }`}
            >
              <div className="text-3xl mb-1">{b.emoji}</div>
              <div className="text-base font-extrabold">{b.label}</div>
              <div className={`text-xs ${active ? "text-slate-700" : "text-white/70"}`}>
                {b.desc}
              </div>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-center text-xs text-white/60 italic">
        Only questions matching the picked age groups will be played.
      </p>
    </div>
  );
}
