import path from "path";

const resolveUploadsRoot = () => {
  const configuredRoot = process.env.UPLOADS_ROOT;

  if (configuredRoot) {
    return path.isAbsolute(configuredRoot)
      ? configuredRoot
      : path.join(process.cwd(), configuredRoot);
  }

  if (process.env.VERCEL) {
    return path.join("/tmp", "uploads");
  }

  return path.join(process.cwd(), "uploads");
};

export const UPLOADS_ROOT = resolveUploadsRoot();

export const getUploadsPath = (...segments) => {
  return path.join(UPLOADS_ROOT, ...segments);
};

