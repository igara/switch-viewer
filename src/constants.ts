export const acountAuthorizeURI = "https://accounts.nintendo.com/connect/1.0.0/authorize";
export const acountSessionTokenURI = "https://accounts.nintendo.com/connect/1.0.0/api/session_token";
export const acountAccessTokenURI = "https://accounts.nintendo.com/connect/1.0.0/api/token";
export const acountMeURI = "https://api.accounts.nintendo.com/2.0.0/users/me";
export const clientID = "71b963c1b7b6d119";
export const userAgent = "OnlineLounge/1.9.0 NASDKAPI Android";
export const customURLScheme = `npf${clientID}`;
export const redirectURL = `${customURLScheme}://auth`;
export const scope = "openid+user+user.birthday+user.mii+user.screenName";