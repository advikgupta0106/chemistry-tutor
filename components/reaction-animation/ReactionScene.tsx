// Picks the scene renderer for a reaction from beaker_view.animation.type.

import type { BeakerView, ReactionAnimation } from "@/lib/content";
import type { SceneProps } from "./shared";
import CombustionScene from "./CombustionScene";
import ElectrolysisScene from "./ElectrolysisScene";
import GasEvolutionScene from "./GasEvolutionScene";
import MetalWaterScene from "./MetalWaterScene";
import PhotolyticScene from "./PhotolyticScene";
import PrecipitationScene from "./PrecipitationScene";
import SolutionScene from "./SolutionScene";
import SurfaceScene from "./SurfaceScene";
import TemperatureScene from "./TemperatureScene";
import ThermalScene from "./ThermalScene";

const SCENES: Record<ReactionAnimation["type"], (props: SceneProps) => React.ReactNode> = {
  combustion: CombustionScene,
  metal_water: MetalWaterScene,
  gas_evolution: GasEvolutionScene,
  precipitation: PrecipitationScene,
  electrolysis: ElectrolysisScene,
  thermal_decomposition: ThermalScene,
  photolytic: PhotolyticScene,
  temperature_change: TemperatureScene,
  displacement: SolutionScene,
  dissolution: SolutionScene,
  colour_change: SolutionScene,
  surface_change: SurfaceScene,
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
  if (!anim) return null;
  const Scene = SCENES[anim.type];
  return <Scene anim={anim} progress={progress} uid={uid} />;
}
