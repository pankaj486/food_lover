import { signAccessToken, signRefreshToken, tokenConfig } from "../_lib/auth";

export function issueTokens(user) {
  return {
    accessToken: signAccessToken(user),
    refreshToken: signRefreshToken(user),
    expiresIn: tokenConfig.accessTtlSeconds,
  };
}
