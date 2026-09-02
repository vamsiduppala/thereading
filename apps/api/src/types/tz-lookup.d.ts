// `tz-lookup` ships no types. It is one function, so declaring it here beats pulling in a
// third-party stub that could drift from the real signature.
//
// It throws for coordinates outside its data rather than returning null, which is why every
// call site wraps it — a row whose zone cannot be resolved is dropped, never defaulted.

declare module 'tz-lookup' {
  /** IANA zone name for a coordinate, e.g. `tz(14.373, 79.091) === 'Asia/Kolkata'`. */
  export default function tzLookup(lat: number, lng: number): string;
}
