export const AUTH_TOKEN_KEY = 'accessToken';

export const authStorage = {
  getToken: (): string | null =>
    typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null,
  setToken: (token: string): void => {
    if (typeof window !== 'undefined') localStorage.setItem(AUTH_TOKEN_KEY, token);
  },
  clearToken: (): void => {
    if (typeof window !== 'undefined') localStorage.removeItem(AUTH_TOKEN_KEY);
  },
};
