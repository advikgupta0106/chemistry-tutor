// Picks the scene renderer for a reaction from beaker_view.animation.type.
// Reactions without animation parameters fall back to the legacy generic
// beaker until they're migrated.

import type { BeakerView, ReactionAnimation } from "@/lib/content";
import type { SceneProps } from "./shared";
import CombustionScene from "./CombustionScene";
import LegacyScene from "./LegacyScene";

const SCENES: Partial<Record<ReactionAnimation["type"], (props: SceneProps) => React.ReactNode>> = {
  combustion: CombustionScene,
};

export default function ReactionScene({
  beakerView,
  progress,
  uid,
}: {
  beakerView: BeakerView;
  progress: number;
  uid: string;
}) {
  const anim = beakerView.animation;
  const Scene = anim ? SCENES[anim.type] : undefined;
  if (anim && Scene) return <Scene anim={anim} progress={progress} uid={uid} />;
  return <LegacyScene beakerView={beakerView} progress={progress} uid={uid} />;
}
