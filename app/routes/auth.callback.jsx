
import { redirect } from "@remix-run/node";

export const loader = async ({ request }) => {
  // console.log('callback',request)
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  const code = url.searchParams.get("code");

  const redirectRoute = "shopify-integration-register";
  const redirectUri = `http://localhost:5173/${redirectRoute}?token=${code}&shop=${shop}`;
  return redirect(redirectUri);
};
