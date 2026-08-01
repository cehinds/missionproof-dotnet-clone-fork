export function matchAirForcePaths(paths, scores, family = "All paths") {
  return paths
    .filter(path => family === "All paths" || path.family === family)
    .map(path => {
      const gaps = Object.entries(path.scores)
        .filter(([, required]) => required > 0)
        .map(([area, required]) => ({ area, required, actual: Number(scores[area] || 0) }))
        .filter(item => item.actual < item.required);
      return { ...path, gaps };
    })
    .sort((a, b) => a.gaps.length - b.gaps.length || a.afsc.localeCompare(b.afsc));
}

export function searchSkillCatalog(catalog, query, type = "All pathways") {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return catalog.filter(item => {
    const haystack = `${item.title} ${item.detail} ${item.tags.join(" ")}`.toLowerCase();
    const matchesQuery = words.length === 0 || words.some(word => haystack.includes(word));
    return matchesQuery && (type === "All pathways" || item.type === type);
  });
}

export function calculatePlanProgress(completedTaskCount, planItemCount, profileFieldCount) {
  const earned = completedTaskCount + Math.min(planItemCount, 2) + (profileFieldCount >= 3 ? 1 : 0);
  return Math.round((earned / 7) * 100);
}

export function togglePlanItem(items, item) {
  return items.some(saved => saved.id === item.id)
    ? items.filter(saved => saved.id !== item.id)
    : [...items, item];
}
