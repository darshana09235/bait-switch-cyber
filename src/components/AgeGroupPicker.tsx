type Props = {
  value: number;
  onChange: (n: number) => void;
};

export function AgeGroupPicker({ value, onChange }: Props) {
  const ages = Array.from({ length: 10 }, (_, i) => i + 5); // 5..14
  return (
    <div className="rounded-3xl bg-white/10 p-6 backdrop-blur">
      <div className="mb-3 flex items-center justify-between gap-4">
        <label className="font-bold text-white">Age group</label>
        <div className="text-2xl font-extrabold text-sand">Ages {value}</div>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {ages.map((a) => {
          const active = a === value;
          return (
            <button
              key={a}
              onClick={() => onChange(a)}
              className={`h-12 w-12 rounded-2xl text-base font-extrabold transition-all ${
                active
                  ? "bg-sand text-slate-900 scale-110 shadow-xl"
                  : "bg-white/15 text-white hover:bg-white/25"
              }`}
            >
              {a}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-center text-xs text-white/60 italic">
        AI explanations for your custom questions will be written for this age.
      </p>
    </div>
  );
}
