/**
 * Section-level skeleton placeholder used as the default LazyLoad fallback.
 * Reserves vertical space so the page never appears blank while sections
 * below the fold are still queued for hydration.
 */
interface SectionPlaceholderProps {
  /** Reserved height (Tailwind class). Default = h-[420px] for landing sections */
  heightClass?: string;
  label?: string;
}

export const SectionPlaceholder = ({
  heightClass = "h-[420px]",
  label,
}: SectionPlaceholderProps) => {
  return (
    <div
      aria-hidden
      className={`${heightClass} w-full px-4 py-10 flex items-center justify-center`}
    >
      <div className="w-full max-w-5xl space-y-4">
        <div className="h-6 w-1/3 mx-auto rounded-md bg-slate-200/60 animate-pulse" />
        <div className="h-4 w-2/3 mx-auto rounded-md bg-slate-200/40 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          <div className="h-28 rounded-2xl bg-slate-200/40 animate-pulse" />
          <div className="h-28 rounded-2xl bg-slate-200/40 animate-pulse" />
          <div className="h-28 rounded-2xl bg-slate-200/40 animate-pulse" />
        </div>
        {label && (
          <p className="text-center text-xs text-slate-400 pt-2">{label}</p>
        )}
      </div>
    </div>
  );
};

export default SectionPlaceholder;
