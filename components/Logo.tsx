import { FlaskConical } from "lucide-react";

const sizeMap = {
  sm: { hex: 28, icon: 14, text: "text-base" },
  md: { hex: 36, icon: 18, text: "text-xl" },
  lg: { hex: 56, icon: 28, text: "text-3xl" },
} as const;

export default function Logo({
  size = "md",
  showWordmark = true,
}: {
  size?: keyof typeof sizeMap;
  showWordmark?: boolean;
}) {
  const { hex, icon, text } = sizeMap[size];

  return (
    <div className="flex items-center gap-3">
      <div className="relative shrink-0" style={{ width: hex, height: hex }}>
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <polygon
            points="50,4 93,27 93,73 50,96 7,73 7,27"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="5"
          />
        </svg>
        <FlaskConical
          size={icon}
          strokeWidth={1.5}
          className="absolute inset-0 m-auto text-accent"
        />
      </div>
      {showWordmark && (
        <span className={`${text} font-bold text-text`}>Chemistry</span>
      )}
    </div>
  );
}
