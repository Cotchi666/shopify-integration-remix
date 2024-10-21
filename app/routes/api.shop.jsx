import { json } from "@remix-run/node";
import db from "../db.server";
export async function loader({ request }) {
  const shops = await db.shop.findMany(); 
  if (shops) {
    const shopInfo = json({
      ok: true,
      message: "Success",
      data: shops,
    });
    return json({ shopInfo });
  }
  return "null";
}

export async function action({ request }) {
  const { method } = request;
  const { shopId, accessToken, isInstalled, oaId, botId, userEmail } =
    await request.json();

  if (method === "POST") {
    if (!shopId) {
      return json({ error: "shopId is required" }, { status: 400 });
    }

    const existingShop = await db.shop.findUnique({
      where: { shopId },
    });

    let shop;
    if (existingShop) {
      shop = await db.shop.update({
        where: { shopId },
        data: { accessToken, botId },
      });
    } else {
      shop = await db.shop.create({
        data: { shopId, oaId, botId, accessToken, isInstalled, userEmail },
      });
    }

    if (userEmail) {
      try {
        await db.session.updateMany({
          where: { email: userEmail },
          data: { emailVerified: true, accessToken: accessToken }, 
        });
      } catch (error) {
        console.error("Failed to update session email:", error);
        return json(
          { error: "Failed to update session email." },
          { status: 500 },
        );
      }
    }
    return json(shop);
  }
  return json({ error: "Method not allowed" }, { status: 405 });
}
