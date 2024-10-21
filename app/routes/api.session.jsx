import { json } from "@remix-run/node";
import db from "../db.server";

export async function loader({ request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  const session = await db.session.findFirst({
    where: { shop },
  });
  if (session) {
    console.log(13);
    return json({
      ok: true,
      message: "Success",
      data: session,
    });
  }
  return "null";
}

export async function action({ request }) {
  const { method } = request;
  const { shop } = await request.json();
  if (method === "GET") {
    // Validate the required fields
    if (!shop) {
      return json({ error: "shop is required" }, { status: 400 });
    }

    // Check if the shop already exists
    const existingShop = await db.session.findUnique({
      where: { shop },
    });

    return json(existingShop);
  }

  return json({ error: "Method not allowed" }, { status: 405 });
}
