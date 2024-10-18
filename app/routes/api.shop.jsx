import { json } from "@remix-run/node";
import db from "../db.server";
export async function loader({ request }) {

  console.log('vao14')

  const shops = await db.shop.findMany(); // Example query
  console.log("shops",shops)
  if (shops){
    const shopInfo = json({
      ok: true,
      message: "Success",
      data: shops,
    });
  
    return json({  shopInfo });
  }
  return "null"

}


export async function action({ request }) {
  const { method } = request;
  const { shopId, accessToken, isInstalled, oaId, botId ,userEmail } = await request.json();

  if (method === "POST") {
      // Create a new shop
      if (!shopId) {
          return json({ error: "shopId is required" }, { status: 400 });
      }

      const shop = await db.shop.create({
          data: { shopId,oaId,botId, accessToken, isInstalled,userEmail },
      });

      return json(shop);
  } else if (method === "PUT") {
      // Update an existing shop
      if (!shopId) {
          return json({ error: "shopId is required" }, { status: 400 });
      }

      const shop = await db.shop.update({
          where: { shopId },
          data: { accessToken, isInstalled },
      });

      return json(shop);
  }

  return json({ error: "Method not allowed" }, { status: 405 });
};