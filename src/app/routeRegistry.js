import { journeyPaths } from "../domain/walkingPath.js";

export const journeyRoutes = Object.freeze([
  { path: journeyPaths.consent, group: "Profile", title: "Consent" },
  { path: journeyPaths.goal, group: "Profile", title: "Starting goal" },
  { path: journeyPaths.profile, group: "Profile", title: "Service profile" },
  { path: journeyPaths.translation, group: "Translate", title: "Experience translation" },
  { path: journeyPaths.results, group: "Explore", title: "Research leads" },
  { path: journeyPaths.plan, group: "Plan", title: "Transition plan" },
]);

export const journeyGroups = Object.freeze([
  { id: "profile", label: "Profile", description: "Your goal and service facts", path: journeyPaths.profile },
  { id: "translate", label: "Translate", description: "Experience in civilian language", path: journeyPaths.translation },
  { id: "explore", label: "Explore", description: "Research leads and pathways", path: journeyPaths.results },
  { id: "plan", label: "Plan", description: "Saved targets and next actions", path: journeyPaths.plan },
]);

const journeyPathSet = new Set(journeyRoutes.map(route => route.path));

export function isJourneyPath(pathname) {
  return pathname === "/app" || journeyPathSet.has(pathname);
}

export function resolveJourneyRoute(pathname) {
  if (pathname === "/app") return journeyRoutes.find(route => route.path === journeyPaths.profile);
  return journeyRoutes.find(route => route.path === pathname) || journeyRoutes[0];
}

export function groupForPath(pathname) {
  return resolveJourneyRoute(pathname).group;
}
