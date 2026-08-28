function normalizeBasePath(basePath = "/") {
  const withLeadingSlash = basePath.startsWith("/") ? basePath : `/${basePath}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
}

export function browserBasePath() {
  return normalizeBasePath(import.meta.env.BASE_URL || "/");
}

export function fromBrowserPath(pathname, basePath = browserBasePath()) {
  const normalizedBase = normalizeBasePath(basePath);
  const baseWithoutTrailingSlash = normalizedBase.slice(0, -1);

  if (normalizedBase === "/") return pathname || "/";
  if (pathname === baseWithoutTrailingSlash || pathname === normalizedBase) return "/";
  if (pathname.startsWith(normalizedBase)) return `/${pathname.slice(normalizedBase.length)}`;
  return pathname || "/";
}

export function toBrowserPath(appPath, basePath = browserBasePath()) {
  const normalizedBase = normalizeBasePath(basePath);
  const normalizedPath = appPath?.startsWith("/") ? appPath : `/${appPath || ""}`;
  if (normalizedBase === "/") return normalizedPath;
  if (normalizedPath === "/") return normalizedBase;
  return `${normalizedBase.slice(0, -1)}${normalizedPath}`;
}

export function assetUrl(relativePath, basePath = browserBasePath()) {
  return `${normalizeBasePath(basePath)}${String(relativePath).replace(/^\/+/, "")}`;
}
