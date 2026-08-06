import Image from "next/image";

// Matches the source asset's real aspect ratio (1041x236) so next/image
// never has to stretch or letterbox it at any of these sizes.
const ASPECT_RATIO = 1041 / 236;

const sizeMap = {
  sm: { height: 28 },
  md: { height: 36 },
  lg: { height: 88 },
} as const;

export default function Logo({ size = "md" }: { size?: keyof typeof sizeMap }) {
  const { height } = sizeMap[size];
  const width = Math.round(height * ASPECT_RATIO);

  return (
    <Image
      src="/brand/atomica-wordmark.png"
      alt="Atomica"
      width={width}
      height={height}
      priority
    />
  );
}
