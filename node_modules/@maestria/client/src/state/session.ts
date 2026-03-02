import type { Colors } from "@maestria/shared";

const STORAGE_KEY = "maestria-session";

export type SessionProfile = {
  userId: string;
  username: string;
  colors: Colors;
};

const defaultProfile: SessionProfile = {
  userId: crypto.randomUUID(),
  username: "",
  colors: {
    hair: 0,
    body: 0,
    pants: 0
  }
};

let session = loadSession();

export function getSession(): SessionProfile {
  return session;
}

export function updateSession(partial: Partial<SessionProfile>): SessionProfile {
  session = {
    ...session,
    ...partial,
    colors: {
      ...session.colors,
      ...(partial.colors ?? {})
    }
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  return session;
}

function loadSession(): SessionProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultProfile;
    }
    const parsed = JSON.parse(raw) as SessionProfile;
    return {
      ...defaultProfile,
      ...parsed,
      colors: {
        ...defaultProfile.colors,
        ...parsed.colors
      }
    };
  } catch {
    return defaultProfile;
  }
}
