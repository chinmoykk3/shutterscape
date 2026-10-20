export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-black">
      <div className="relative w-12 h-12 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-amber/20 border-t-amber rounded-full animate-spin" />
        <div className="absolute w-2 h-2 rounded-full bg-amber" />
      </div>
      <span className="font-mono text-xs tracking-widest text-offwhite-dim uppercase">
        Exposing Frame...
      </span>
    </div>
  );
}