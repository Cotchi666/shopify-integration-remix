import { json } from "@remix-run/node";

export const action = async ({ request }) => {
  // Handle the incoming webhook request
  const body = await request.json();

  // Log the webhook data for debugging
  console.log("Received webhook:", body);

  // Perform any necessary actions (e.g., delete the shop from your database)
  // Example: await prisma.shop.delete({ where: { shopId: body.shop_id } });

  return json({ received: true });
};
