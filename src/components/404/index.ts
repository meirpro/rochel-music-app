export { LostNote } from "./LostNote";
export { MusicalRest } from "./MusicalRest";
export { WrongKey } from "./WrongKey";
export { OffBeat } from "./OffBeat";
export { EmptyMeasure } from "./EmptyMeasure";

export const NOT_FOUND_DESIGNS = [
  {
    id: "lost-note",
    name: "Lost Note",
    description: "A note that fell off the staff",
  },
  {
    id: "musical-rest",
    name: "Musical Rest",
    description: "A giant quarter rest with a pun",
  },
  {
    id: "wrong-key",
    name: "Wrong Key",
    description: "A piano with one key highlighted wrong",
  },
  {
    id: "off-beat",
    name: "Off Beat",
    description: "Notes bouncing at wrong intervals",
  },
  {
    id: "empty-measure",
    name: "Empty Measure",
    description: "A minimalist empty staff measure",
  },
] as const;

export type NotFoundDesignId = (typeof NOT_FOUND_DESIGNS)[number]["id"];
