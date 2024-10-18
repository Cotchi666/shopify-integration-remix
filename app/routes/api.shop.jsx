import { json } from "@remix-run/node";
import db from "../db.server";
export async function loader({ request }) {
  console.log("vao14");

  const shops = await db.shop.findMany(); // Example query
  console.log("shops", shops);
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
  console.log("22", request);
  const { method } = request;
  const { shopId, accessToken, isInstalled, oaId, botId, userEmail } =
    await request.json();
  console.log(accessToken, shopId, userEmail);
  if (method === "POST") {
    // Validate the required fields
    if (!shopId) {
      return json({ error: "shopId is required" }, { status: 400 });
    }

    // Check if the shop already exists
    const existingShop = await db.shop.findUnique({
      where: { shopId },
    });

    let shop;
    if (existingShop) {
      // Update the existing shop
      shop = await db.shop.update({
        where: { shopId },
        data: { accessToken},
      });
    } else {
      // Create a new shop
      shop = await db.shop.create({
        data: { shopId, oaId, botId, accessToken, isInstalled, userEmail },
      });
    }

    // Update the session email if the userEmail is provided
    if (userEmail) {
      try {
        await db.session.updateMany({
          where: { email: userEmail }, // Update all sessions related to this shop
          data: { emailVerified: true, accessToken: accessToken }, // Optionally set emailVerified to true
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

// export async function action({ request }) {
//   const { method } = request;
//   const { shopId, accessToken, isInstalled, oaId, botId, userEmail } =await request.json();
//   console.log("23", request)
//   if (method === "POST") {
//     // Create a new shop
//     if (!shopId) {
//       return json({ error: "shopId is required" }, { status: 400 });
//     }

//     const shop = await db.shop.create({
//       data: { shopId, oaId, botId, accessToken, isInstalled, userEmail },
//     });

//     return json(shop);
//   } else if (method === "PUT") {
//     // Update an existing shop
//     if (!shopId) {
//       return json({ error: "shopId is required" }, { status: 400 });
//     }

//     const shop = await db.shop.update({
//       where: { shopId },
//       data: { accessToken, isInstalled },
//     });

//     return json(shop);
//   }

//   return json({ error: "Method not allowed" }, { status: 405 });
// }
