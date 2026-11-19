// Packages that ship without TypeScript declarations.
declare module 'eslint-config-expo/flat';

// Internal React Native module (no public types). Only the part BaseScreen uses.
declare module 'react-native/Libraries/Components/TextInput/TextInputState' {
  const TextInputState: {
    currentlyFocusedInput(): {
      measureInWindow(
        callback: (x: number, y: number, width: number, height: number) => void,
      ): void;
    } | null;
  };
  export default TextInputState;
}
