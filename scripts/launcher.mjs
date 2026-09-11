import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const rootDirectory = path.resolve(scriptDirectory, "..");
const envFile = path.join(rootDirectory, ".env");
const apiBundle = path.join(
  rootDirectory,
  "artifacts",
  "api-server",
  "dist",
  "index.mjs",
);
const staticServer = path.join(scriptDirectory, "static-server.mjs");
const frontendDirectory = path.join(
  rootDirectory,
  "artifacts",
  "turbobyte",
  "dist",
  "public",
);

if (typeof process.loadEnvFile !== "function") {
  throw new Error(
    "The root launcher requires Node.js 22 or newer (process.loadEnvFile is unavailable).",
  );
}

if (existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

const children = new Set();
let shuttingDown = false;
let shutdownPromise;

function readPort(name, fallback) {
  const rawValue = process.env[name] ?? fallback;
  const value = Number(rawValue);

  if (!Number.isInteger(value) || value < 1 || value > 65535) {
    throw new Error(
      `Invalid ${name} value "${rawValue}". Use a TCP port from 1 to 65535.`,
    );
  }

  return value;
}

function pnpmInvocation(args) {
  const npmExecPath = process.env.npm_execpath;
  const pnpmUserAgent = process.env.npm_config_user_agent?.startsWith("pnpm/");
  const isPnpmScript =
    npmExecPath &&
    (pnpmUserAgent || /(?:^|[\\/])pnpm(?:\.c?js)?$/i.test(npmExecPath));

  // Calling the package-manager script with the current Node executable works
  // on Windows as well as POSIX. In particular, it avoids trying to spawn a
  // .cmd shim with the wrong executable type (EINVAL on some Node versions).
  if (isPnpmScript) {
    return {
      args: [npmExecPath, ...args],
      command: process.execPath,
    };
  }

  return {
    args,
    command: process.platform === "win32" ? "pnpm.cmd" : "pnpm",
  };
}

function spawnPnpm(args, env, label) {
  const invocation = pnpmInvocation(args);
  return spawnChild(invocation.command, invocation.args, env, label);
}

function runPnpm(args, env, label) {
  const invocation = pnpmInvocation(args);
  return runCommand(invocation.command, invocation.args, env, label);
}

function spawnChild(command, args, env, label) {
  const child = spawn(command, args, {
    cwd: rootDirectory,
    env,
    stdio: "inherit",
    windowsHide: false,
  });

  children.add(child);
  child.once("close", () => {
    children.delete(child);
  });
  child.once("error", (error) => {
    console.error(`${label} failed to start: ${error.message}`);
  });

  return child;
}

function runCommand(command, args, env, label) {
  return new Promise((resolve, reject) => {
    const child = spawnChild(command, args, env, label);
    let settled = false;

    const finish = (callback) => {
      if (settled) return;
      settled = true;
      callback();
    };

    child.once("error", (error) => {
      finish(() => reject(error));
    });
    child.once("close", (code, signal) => {
      finish(() => {
        if (code === 0) {
          resolve();
          return;
        }

        const result = signal ? `signal ${signal}` : `exit code ${code}`;
        reject(new Error(`${label} stopped with ${result}.`));
      });
    });
  });
}

function apiEnvironment(port, nodeEnvironment) {
  return {
    ...process.env,
    API_PORT: String(port),
    NODE_ENV: nodeEnvironment,
    PORT: String(port),
  };
}

function webEnvironment(port, apiPort, nodeEnvironment) {
  // Spread the launcher environment so every VITE_* variable from the root
  // .env is available to Vite. Vite itself only exposes the VITE_* subset.
  return {
    ...process.env,
    API_PROXY_TARGET: `http://127.0.0.1:${apiPort}`,
    NODE_ENV: nodeEnvironment,
    PORT: String(port),
    WEB_PORT: String(port),
  };
}

async function buildApi(env) {
  await runPnpm(
    ["--filter", "@workspace/api-server", "run", "build"],
    env,
    "API build",
  );
}

function startApi(port, nodeEnvironment) {
  return spawnChild(
    process.execPath,
    ["--enable-source-maps", apiBundle],
    apiEnvironment(port, nodeEnvironment),
    "API server",
  );
}

function startVite(port, apiPort) {
  return spawnPnpm(
    ["--filter", "@workspace/turbobyte", "run", "dev"],
    webEnvironment(port, apiPort, "development"),
    "Vite",
  );
}

function startStaticServer(port, apiPort) {
  return spawnChild(
    process.execPath,
    [staticServer],
    {
      ...webEnvironment(port, apiPort, "production"),
      API_HOST: "127.0.0.1",
      API_PORT: String(apiPort),
      STATIC_DIR: frontendDirectory,
    },
    "static web server",
  );
}

function waitForServiceExit(serviceChildren) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (callback) => {
      if (settled) return;
      settled = true;
      callback();
    };

    for (const child of serviceChildren) {
      child.once("error", (error) => {
        finish(() => reject(error));
      });
      child.once("close", (code, signal) => {
        if (shuttingDown) return;
        finish(() => {
          const result = signal ? `signal ${signal}` : `exit code ${code}`;
          reject(new Error(`A long-running service stopped with ${result}.`));
        });
      });
    }
  });
}

function shutdown(exitCode) {
  if (shutdownPromise) return shutdownPromise;

  shuttingDown = true;
  process.exitCode = exitCode;
  shutdownPromise = new Promise((resolve) => {
    for (const child of children) {
      if (!child.killed) {
        child.kill("SIGTERM");
      }
    }

    // Do not leave a failed or interrupted launcher waiting forever for a
    // child process that does not handle SIGTERM.
    setTimeout(() => {
      for (const child of children) {
        if (child.exitCode === null && child.signalCode === null) {
          child.kill("SIGKILL");
        }
      }
      process.exitCode = exitCode;
      resolve();
    }, 1000).unref();
  });

  return shutdownPromise;
}

process.once("SIGINT", () => {
  void shutdown(130);
});
process.once("SIGTERM", () => {
  void shutdown(143);
});

async function runDev() {
  const apiPort = readPort("API_PORT", process.env.PORT ?? "8080");
  const webPort = readPort("WEB_PORT", "5173");
  const apiEnv = apiEnvironment(apiPort, "development");

  await buildApi(apiEnv);
  const api = startApi(apiPort, "development");
  const web = startVite(webPort, apiPort);
  await waitForServiceExit([api, web]);
}

async function runStart() {
  const apiPort = readPort("API_PORT", process.env.PORT ?? "8080");
  const webPort = readPort("WEB_PORT", "5173");

  if (!existsSync(apiBundle)) {
    throw new Error(
      `Built API bundle not found at ${apiBundle}. Run "pnpm run build" first.`,
    );
  }
  if (!existsSync(path.join(frontendDirectory, "index.html"))) {
    throw new Error(
      `Built frontend not found at ${frontendDirectory}. Run "pnpm run build" first.`,
    );
  }

  const api = startApi(apiPort, "production");
  const web = startStaticServer(webPort, apiPort);
  await waitForServiceExit([api, web]);
}

async function runDbPush() {
  await runPnpm(
    ["--filter", "@workspace/db", "run", "push"],
    process.env,
    "database schema push",
  );
}

async function runBuild() {
  await runPnpm(["run", "build:workspace"], process.env, "workspace build");
}

async function main() {
  const command = process.argv[2];

  if (command === "dev") {
    await runDev();
    return;
  }
  if (command === "start") {
    await runStart();
    return;
  }
  if (command === "build") {
    await runBuild();
    return;
  }
  if (command === "db:push") {
    await runDbPush();
    return;
  }

  throw new Error(
    `Unknown command "${command ?? ""}". Use one of: dev, build, start, db:push.`,
  );
}

main()
  .catch(async (error) => {
    console.error(error instanceof Error ? error.message : error);
    await shutdown(1);
  })
  .finally(() => {
    if (!shuttingDown && children.size === 0) {
      process.exitCode ??= 0;
    }
  });