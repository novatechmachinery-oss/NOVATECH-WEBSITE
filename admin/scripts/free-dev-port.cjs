const { execFileSync } = require("node:child_process");

const PORT = "3002";

function run(command, args) {
  try {
    return execFileSync(command, args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return "";
  }
}

function getWindowsPids() {
  return run("netstat", ["-ano"])
    .split(/\r?\n/)
    .filter((line) => line.includes(`:${PORT}`) && line.includes("LISTENING"))
    .map((line) => line.trim().split(/\s+/).at(-1))
    .filter(Boolean);
}

function stopPid(pid) {
  run("taskkill", ["/PID", pid, "/F", "/T"]);
}

if (process.platform === "win32") {
  const pids = [...new Set(getWindowsPids())];

  for (const pid of pids) {
    stopPid(pid);
    console.log(`Stopped process ${pid} on port ${PORT}.`);
  }

  if (pids.length === 0) {
    console.log(`Port ${PORT} is free.`);
  }
} else {
  const pids = run("lsof", ["-ti", `:${PORT}`])
    .split(/\r?\n/)
    .map((pid) => pid.trim())
    .filter(Boolean);

  for (const pid of [...new Set(pids)]) {
    try {
      process.kill(Number(pid), "SIGTERM");
      console.log(`Stopped process ${pid} on port ${PORT}.`);
    } catch {
      // The process may have already exited.
    }
  }

  if (pids.length === 0) {
    console.log(`Port ${PORT} is free.`);
  }
}
