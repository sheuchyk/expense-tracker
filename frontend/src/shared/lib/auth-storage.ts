export const AUTH_TOKEN_KEY = 'accessToken';

export const authStorage = {
  getToken: (): string | null =>
    typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null,
  setToken: (token: string): void => localStorage.setItem(AUTH_TOKEN_KEY, token),
  clearToken: (): void => localStorage.removeItem(AUTH_TOKEN_KEY),
};
