import Hyperspeed from "./Hyperspeed";

import { hyperspeedPresets } from "./HyperSpeedPresets";
export default function HyperspeedBackground() {
  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden"
      style={{ width: "100vw", height: "100vh" }}
    >
      <Hyperspeed effectOptions={hyperspeedPresets.one} />

      {/* Dark overlay so content is readable */}
      <div className="absolute inset-0 bg-black/70" />
    </div>
  );
}
