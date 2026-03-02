import { buildAuthorization, type AuthObject } from "@retroachievements/api";

const RA_API_DELAY_MS = 1000;

let previousRaCall: Promise<unknown> = Promise.resolve();
let cachedAuthorization: AuthObject | null = null;

function getAuthorizationFromEnv(): AuthObject {
  if (cachedAuthorization) {
    return cachedAuthorization;
  }

  const username = process.env.RA_USERNAME;
  const webApiKey = process.env.RA_API_KEY;

  if (!username || !webApiKey) {
    throw new Error("Missing RA_USERNAME or RA_API_KEY in environment.");
  }

  cachedAuthorization = buildAuthorization({ username, webApiKey });
  return cachedAuthorization;
}

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

export async function callRaApi<T>(
  call: (authorization: AuthObject) => Promise<T>,
  operationName: string = "unknown",
): Promise<T> {
  const authorization = getAuthorizationFromEnv();

  const scheduledCall = previousRaCall.then(async () => {
    console.log(`[RA API] ${operationName}`);
    await sleep(RA_API_DELAY_MS);

    try {
      const result = await call(authorization);
      return result;
    } catch (error) {
      console.log(`[RA API] ${operationName} failed`);
      throw error;
    }
  });

  previousRaCall = scheduledCall.then(
    () => undefined,
    () => undefined,
  );

  return scheduledCall;
}