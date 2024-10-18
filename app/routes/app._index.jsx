import { useEffect } from "react";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  Page,
  // Layout,
  Text,
  // Card,
  Button,
  BlockStack,
  Box,
  // List,
  // Link,
  InlineStack,
  LegacyCard,
  DataTable,
  Badge,
} from "@shopify/polaris";
// import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { format } from "date-fns";

export const loader = async ({ request }) => {
  // console.log("request", request);
  const { session, sessionToken } = await authenticate.admin(request);
  const shops = await db.shop.findMany();
  const token = sessionToken.sub;
  console.log(session.accessToken, "THE USER ID");
  console.log("token", token);
  console.log("session", session);
  const GET_SHOP_DETAILS = `
  query {
    shop {
      id
      name
      email
      myshopifyDomain
      primaryDomain {
        url
        host
      }
    }
  }
`;

  const shopDetailsResponse = await fetch(
    `https://${session.shop}/admin/api/2024-07/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": session.accessToken,
      },
      body: JSON.stringify({ query: GET_SHOP_DETAILS }),
    },
  );

  const shopData = await shopDetailsResponse.json();
  // console.log('shopdata',shopData)
  if (!shopData || shopData.errors) {
    return json({
      shopId: "",
      shopName: "",
      shopEmail: "",
      myshopifyDomain: "",
      primaryDomain: "",
      data: [],
      session: session,
    });
  }
  console.log("data", shops);
  // Return the shop details
  return json({
    shopId: shopData.data.shop.id,
    shopName: shopData.data.shop.name,
    shopEmail: shopData.data.shop.email,
    myshopifyDomain: shopData.data.shop.myshopifyDomain,
    primaryDomain: shopData.data.shop.primaryDomain,
    data:  shops,
    session: session,
  });
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  console.log("admin", admin);
};
export default function Index() {
  const fetcher = useFetcher();
  // const shopify = useAppBridge();
  const { session, data, shopEmail, myshopifyDomain } = useLoaderData();

  const generateRegisterUrl = () => {
    // const redirectRoute = "shopify-integration-register";
    // const redirectUri = `http://localhost:5173/${redirectRoute}`;
    const redirectUri = `https://appointments-reflected-teddy-formerly.trycloudflare.com/auth/callback`;
    const SHOP = session.shop
    const SCOPE =
      "read_products, write_products, read_orders, write_orders, read_customers, write_customers, read_inventory, write_inventory, read_shipping, write_shipping, read_checkouts, write_checkouts, read_discounts, write_discounts, read_price_rules, write_price_rules, read_fulfillments, write_fulfillments, read_draft_orders, write_draft_orders, read_content, write_content, read_themes, write_themes, read_shopify_payments_payouts, read_script_tags, write_script_tags, read_translations, write_translations, read_files, write_files";
    const CLIENT_ID = "280818e662c2957ab13e5007b064455e";
    const nonce = "";
    return `https://${SHOP}/admin/oauth/authorize?client_id=${CLIENT_ID}&scope=${SCOPE}&redirect_uri=${redirectUri}&state=${nonce}`;
  };

  let rows = [];
  console.log('107',data)
  if (data.length > 0) {
    rows = data.map((item) => [
      // eslint-disable-next-line react/jsx-key
      <Text variation="strong">{item.id}</Text>,
        item.shopId,
        item.oaId,
        item.botId,
        format(new Date(item.createdAt), "PPP"), 
        item.isInstalled ? (
          <Badge status="success">Installed</Badge>
        ) : (
          <Badge status="warning">Not Installed</Badge>
        ),
      // eslint-disable-next-line react/jsx-key
      <Button
        onClick={() => {
          const url = `http://localhost:5173/bot/${item.botId}`;
          window.open(url, "_blank"); 
        }}
      >
        View Bot
      </Button>,
    ]);
  }
  console.log("data", data);
  console.log("rows", rows[0]);
  return (
    <>
      {rows[0].length > 0 ? (
        <>
          <Page
            fullWidth
            title="TomAI fetched data"
            subtitle="Overview of all bots and installations"
          >
            <LegacyCard sectioned>
              <DataTable
                columnContentTypes={[
                  "text",
                  "text",
                  "text",
                  "text",
                  "text",
                  "text",
                ]}
                headings={[
                  "ID",
                  "Shop ID",
                  "OA ID",
                  "Bot ID",
                  "Created At",
                  "Status",
                ]}
                rows={rows}
                footerContent={`Total Bots: ${rows.length}`}
              />
            </LegacyCard>
          </Page>
        </>
      ) : (
        <>
          <Text style={{ boder: "0" }} title="Tom AI Chatbot" />
          <Page fullWidth>
            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.9)", // Slightly transparent white background
                borderRadius: "12px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center", // Center content
                alignItems: "center", // Vertically center content
                padding: "20px",
                paddingBottom: "20px",
                marginTop: "40px",
                margin: "40px",
                marginRight: "180px",
                marginLeft: "180px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                // border: "1px solid #D8D8D8", // Blue border with 2px width
              }}
            >
              <div
                style={{
                  borderWidth: "1px black",
                  marginBottom: "10px",
                  borderRadius: "15px", // Rounded corners
                  width: "95%", // Full width of the container
                  textAlign: "start", // Center the logo within the container
                  margin: "28px",
                  background: "linear-gradient(135deg, #007bff, #28a745)", // Blue to green gradient background
                }}
              >
                <img
                  src="https://portal.tomai.vn/assets/thumnail_logo_sign_in-RyJpA-NT.png"
                  alt="TomAI Logo"
                  style={{
                    marginTop: "15px",
                    width: "500px", // Logo size
                    // Ensure the logo itself is fully visible
                  }}
                />
              </div>

              {/* Main content area */}
              <div
                style={{
                  padding: "20px",
                  width: "100%",
                  maxWidth: "900px",
                }}
              >
                <BlockStack gap="500">
                  <BlockStack gap="200">
                    {/* Title */}
                    <Text
                      variant="headingMd"
                      style={{
                        color: "#333",
                        fontSize: "64px", // Increased font size for bigger text
                        fontWeight: "bold",
                        textAlign: "center",
                        lineHeight: "1.2", // Adjusts line height for better spacing
                        marginBottom: "20px", // Adds some space below the title
                      }}
                    >
                      Welcome to TomAI 🎉
                    </Text>

                    {/* Body text */}
                    <Text
                      as="p"
                      variant="bodyMd"
                      style={{
                        color: "#555",
                        fontSize: "1.2rem",
                        lineHeight: "1.5",
                        textAlign: "center",
                      }}
                    >
                      Join TomAI today to start leveraging AI-driven chatbots
                      that streamline customer support, increase engagement, and
                      help grow your business. Our cutting-edge technology is
                      designed to be intuitive and easy to use.
                    </Text>
                  </BlockStack>

                  {/* Buttons */}
                  <InlineStack
                    gap="300"
                    style={{ justifyContent: "center", marginTop: "20px" }}
                  >
                    {/* Primary Button */}
                    <Button
                      variant="primary"
                      style={{
                        padding: "10px 20px",
                        borderRadius: "15px",
                        fontSize: "1rem",
                        fontWeight: "bold",
                        border: "1px solid #D8D8D8", // Blue border with 2px width
                      }}
                      onClick={() => {
                        window.open(generateRegisterUrl(), "_blank");
                      }}
                    >
                      Connect to TomAI
                    </Button>

                    {/* Secondary Button */}
                    <Button
                      variant="secondary"
                      style={{
                        padding: "10px 20px",
                        borderRadius: "15px",
                        fontSize: "1rem",
                        fontWeight: "bold",
                        border: "1px solid #D8D8D8", // Blue border with 2px width
                      }}
                      onClick={() => window.open("https://tomai.vn/", "_blank")}
                    >
                      Learn More
                    </Button>
                  </InlineStack>

                  {/* Product display logic (if available) */}
                  {fetcher.data?.product && (
                    <>
                      <Text
                        as="h3"
                        variant="headingMd"
                        style={{
                          color: "#007bff",
                          fontSize: "1.4rem",
                          marginTop: "40px",
                          textAlign: "center",
                        }}
                      >
                        Product Created
                      </Text>
                      <Box
                        padding="20px"
                        background="rgba(0, 123, 255, 0.1)"
                        borderRadius="12px"
                        overflowX="scroll"
                        style={{
                          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                          marginBottom: "20px",
                        }}
                      >
                        <pre
                          style={{
                            margin: 0,
                            color: "#333",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          <code>
                            {JSON.stringify(fetcher.data.product, null, 2)}
                          </code>
                        </pre>
                      </Box>
                    </>
                  )}
                </BlockStack>
              </div>
            </div>{" "}
          </Page>
        </>
      )}
    </>
  );
}
