import path from "node:path";

function resolveProjectRoot() {
  const currentDirectory = process.cwd();
  const currentName = path.basename(currentDirectory).toLowerCase();

  if (currentName === "admin") {
    return path.resolve(currentDirectory, "..");
  }

  return currentDirectory;
}

export function resolveProjectPath(...segments: string[]) {
  return path.join(resolveProjectRoot(), ...segments);
}
