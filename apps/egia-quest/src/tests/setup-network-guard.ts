
const blockedFetch = async (): Promise<never> => {
  throw new Error("NETWORK_ACCESS_BLOCKED");
};

Object.defineProperty(globalThis, "fetch", {
  configurable: true,
  value: blockedFetch,
  writable: false,
});
