// app/routes/auth/callback.jsx

import { json, redirect } from "@remix-run/node";
// import { getSession, commitSession } from "~/sessions";
// import { verifyHmac, exchangeTemporaryCodeForAccessToken } from "~/shopify";

export const loader = async ({ request }) => {
  console.log('666')
  const url = new URL(request.url);
  const hmac = url.searchParams.get("hmac");
  const shop = url.searchParams.get("shop");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  console.log("13 vao")
  console.log('first')
  // if (!hmac || !shop || !code) {
  //   return json({ error: "Missing required parameters" }, { status: 400 });
  // }

  // if (!verifyHmac(url.searchParams)) {
  //   return json({ error: "HMAC verification failed" }, { status: 400 });
  // }

  // const accessToken = await exchangeTemporaryCodeForAccessToken(shop, code);

  // if (!accessToken) {
  //   return json({ error: "Failed to obtain access token" }, { status: 400 });
  // }

  // const session = await getSession(request.headers.get("Cookie"));
  // session.set("shop", shop);
  // session.set("accessToken", accessToken);
  const redirectRoute = "shopify-integration-register";
  const redirectUri = `http://localhost:5173/${redirectRoute}/token={token}/shope`;
  return redirect(redirectUri);
};
