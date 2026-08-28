export function canRegisterMissionProofPwa({ navigatorObject = globalThis.navigator } = {}) {
  return Boolean(import.meta.env.PROD && navigatorObject && "serviceWorker" in navigatorObject);
}

export function registerMissionProofPwa({
  navigatorObject = globalThis.navigator,
  windowObject = globalThis.window,
} = {}) {
  if (!canRegisterMissionProofPwa({ navigatorObject }) || !windowObject) return;

  const baseUrl = import.meta.env.BASE_URL || "/";

  const register = () => {
    navigatorObject.serviceWorker.register(`${baseUrl}sw.js`, {
      scope: baseUrl,
      updateViaCache: "none",
    }).catch(error => {
      console.warn("MissionProof offline shell could not be registered.", error);
    });
  };

  if (globalThis.document?.readyState === "complete") register();
  else windowObject.addEventListener("load", register, { once: true });
}
