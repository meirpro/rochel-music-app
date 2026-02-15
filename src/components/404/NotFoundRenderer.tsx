"use client";

import { LostNote } from "./LostNote";
import { MusicalRest } from "./MusicalRest";
import { WrongKey } from "./WrongKey";
import { OffBeat } from "./OffBeat";
import { EmptyMeasure } from "./EmptyMeasure";
import type { NotFoundDesignId } from "./index";

const DESIGN_MAP: Record<NotFoundDesignId, React.ComponentType> = {
  "lost-note": LostNote,
  "musical-rest": MusicalRest,
  "wrong-key": WrongKey,
  "off-beat": OffBeat,
  "empty-measure": EmptyMeasure,
};

export function NotFoundRenderer({ designId }: { designId: NotFoundDesignId }) {
  const Component = DESIGN_MAP[designId];
  return <Component />;
}
