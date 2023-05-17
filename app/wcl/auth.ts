import { upstash } from "~/redis";

export type WCLOAuthResponse = {
  access_token: string;
  expires_in: number;
  token_type: "Bearer";
};

export type WCLAuth = {
  token: string;
  expiresAt: number;
};

export const setWCLAuthentication = async ({
  access_token,
  expires_in,
}: WCLOAuthResponse): Promise<void> => {
  const payload: WCLAuth = {
    token: access_token,
    expiresAt: Math.round(Date.now() / 1000) + expires_in,
  };

  await upstash.set<WCLAuth>("wcl-auth-token", payload, {
    ex: expires_in,
  });
};

export const getWCLAuthentication = (): Promise<WCLAuth | null> => {
  if (process.env.NODE_ENV === "test") {
    return Promise.resolve({
      token: "mock-token",
      expiresAt: Date.now() + 28 * 24 * 60 * 60 * 1000,
    });
  }

  return upstash.get<WCLAuth>("wcl-auth-token");
};
