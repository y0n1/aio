const globalWithProcess = globalThis as typeof globalThis & {
  process?: { env?: Record<string, string | undefined> };
  IS_REACT_ACT_ENVIRONMENT?: boolean;
};

globalWithProcess.IS_REACT_ACT_ENVIRONMENT = true;

if (globalWithProcess.process === undefined) {
  globalWithProcess.process = { env: {} };
} else if (globalWithProcess.process.env === undefined) {
  globalWithProcess.process.env = {};
}

const env = globalWithProcess.process.env ??
  (globalWithProcess.process.env = {});
env.NODE_ENV ??= "test";
