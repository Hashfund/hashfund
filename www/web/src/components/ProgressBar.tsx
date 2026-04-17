import clsx from "clsx";

type ProgressBarProps = {
  className?: string;
  value: number;
};
export default function ProgressBar({ className, value }: ProgressBarProps) {
  const percent = Math.min(Math.max(value, 0), 100);
  
  return (
    <div className={clsx(className, "relative w-full h-3 bg-dark-800/50 rounded-full overflow-hidden border border-white/5 shadow-inner")}>
      <div
        className={clsx(
          "h-full rounded-full transition-all duration-1000 ease-out relative",
          percent > 90 ? "bg-gradient-to-r from-primary to-white shadow-[0_0_15px_rgba(255,215,0,0.5)]" : "bg-gradient-to-r from-primary-600 to-primary"
        )}
        style={{ width: `${percent}%` }}
      >
        {/* Shine effect */}
        <div className="absolute inset-0 bg-white/20 w-full h-full skew-x-[-20deg] translate-x-[-100%] animate-pulse" 
             style={{ animation: 'shine 3s infinite' }} 
        />
      </div>
      <style jsx>{`
        @keyframes shine {
          0% { transform: translateX(-150%) skewX(-20deg); }
          50% { transform: translateX(150%) skewX(-20deg); }
          100% { transform: translateX(150%) skewX(-20deg); }
        }
      `}</style>
    </div>
  );
}
