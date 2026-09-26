// expo-router registers these matchers at runtime but ships no type declarations for them.
declare namespace jest {
  interface Matchers<R> {
    toHavePathname(pathname: string): R;
    toHavePathnameWithParams(pathname: string): R;
    toHaveSegments(segments: string[]): R;
    toHaveSearchParams(params: Record<string, string>): R;
    toHaveRouterState(state: unknown): R;
  }
}
