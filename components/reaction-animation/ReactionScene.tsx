// Picks the scene renderer for a reaction from beaker_view.animation.type.
// Reactions without animation parameters fall back to the legacy generic
// beaker until they're migrated.

import type { BeakerView, ReactionAnimation } from "@/lib/content";
import type { SceneProps } from "./shared";
import CombustionScene from "./CombustionScene";
import GasEvolutionScene from "./GasEvolutionScene";
import LegacyScene from "./LegacyScene";
import MetalWaterScene from "./MetalWaterScene";
import PrecipitationScene from "./PrecipitationScene";

const SCENES: Partial<Record<ReactionAnimation["type"], (props: SceneProps) => React.ReactNode>> = {
  combustion: CombustionScene,
  metal_water: MetalWaterScene,
  gas_evolution: GasEvolutionScene,
  precipitation: PrecipitationScene,
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
