import { json } from "@remix-run/node";
import db from "../db.server";

// Loader function to fetch all bots
export async function loader({ request }) {
  try {
    const bots = await db.bot.findMany();
    console.log('bots',bots)
    return json({
      ok: true,
      message: "Success",
      data: bots,
    });

  } catch (error) {
    console.error("Failed to load bot data:", error);
    return json({ error: "Failed to load bot data" }, { status: 500 });
  }
}

// Action function to update or create a bot
export async function action({ request }) {
  const { method } = request;

  // Ensure we can read the JSON body
  const { isActive, botToken, botType, sessionId } = await request.json().catch((error) => {
    console.error("Failed to parse JSON body:", error);
    return json({ error: "Invalid JSON body" }, { status: 400 });
  });

  if (method === "POST") {
    // Validate the required field
    if (!botToken) {
      return json({ error: "botToken is required" }, { status: 400 });
    }

    try {
      const shop = await db.bot.create({
        data: { isActive, botToken, botType, sessionId },
      });

      return json(shop);
    } catch (error) {
      console.error("Failed to update/create bot:", error);
      return json({ error: "Failed to update/create bot" }, { status: 500 });
    }
  }

  // Return an error for unsupported methods
  return json({ error: "Method not allowed" }, { status: 405 });
}
