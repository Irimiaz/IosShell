// Every screen receives the data it was opened with as a `data` prop.
// Data is any object (or undefined if the screen takes none). Declare the
// shape you expect in the screen's own props, e.g.:
//   export function Details({ data }: ScreenProps<{ name: string }>) { ... }
export type ScreenProps<D extends object | undefined = object | undefined> = {
  data: D;
};
