type Props = {
  sender: string;
  message: string;
};

export function PhoneCard({ sender, message }: Props) {
  const initial = sender.trim().charAt(0).toUpperCase();
  return (
    <div className="mx-auto w-full max-w-xl rounded-[2rem] bg-white text-slate-900 shadow-2xl ring-4 ring-white/20 overflow-hidden">
      {/* status bar */}
      <div className="flex items-center justify-between px-6 pt-3 pb-2 text-xs font-semibold text-slate-500">
        <span>9:41</span>
        <span className="flex gap-1">
          <span>📶</span>
          <span>🔋</span>
        </span>
      </div>
      {/* sender row */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 text-lg font-bold text-white">
          {initial}
        </div>
        <div>
          <div className="text-base font-bold leading-tight">{sender}</div>
          <div className="text-xs text-slate-400">now</div>
        </div>
      </div>
      {/* message */}
      <div className="px-6 py-6">
        <p className="text-lg sm:text-xl font-semibold leading-snug">
          {message}
        </p>
      </div>
    </div>
  );
}
