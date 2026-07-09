export const AUTH_KEY = "pisti.session";

export type SessionUser = {
  username: string;
  email: string;
};

export const getSession = (): SessionUser | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
};

export const setSession = (session: SessionUser) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
};

export const clearSession = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_KEY);
};
