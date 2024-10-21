import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  Page,
  Text,
  Button,
  BlockStack,
  Box,
  InlineStack,
  LegacyCard,
  DataTable,
  Badge,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { format } from "date-fns";

export const loader = async ({ request }) => {
  const { session, sessionToken } = await authenticate.admin(request);
  const shops = await db.shop.findMany();
  const shopDetails = await fetchShopDetails(session);

  if (!shopDetails || shopDetails.errors) {
    return json(emptyShopResponse(session));
  }

  return json({
    shopId: shopDetails.data.shop.id,
    shopName: shopDetails.data.shop.name,
    shopEmail: shopDetails.data.shop.email,
    myshopifyDomain: shopDetails.data.shop.myshopifyDomain,
    primaryDomain: shopDetails.data.shop.primaryDomain,
    data: shops,
    session: session,
  });
};

const fetchShopDetails = async (session) => {
  const query = `
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
  const response = await fetch(
    `https://${session.shop}/admin/api/2024-07/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": session.accessToken,
      },
      body: JSON.stringify({ query }),
    },
  );
  return response.json();
};

const emptyShopResponse = (session) => ({
  shopId: "",
  shopName: "",
  shopEmail: "",
  myshopifyDomain: "",
  primaryDomain: "",
  data: [],
  session: session,
});

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  console.log("Admin authenticated:", admin);
};

const generateRegisterUrl = (shop) => {
  const redirectUri =
    "https://instructional-wilderness-browser-functional.trycloudflare.com/auth/callback";

  const scope = [
    "read_products",
    "write_products",
    "read_orders",
    "write_orders",
    "read_customers",
    "write_customers",
    "read_inventory",
    "write_inventory",
    "read_shipping",
    "write_shipping",
    "read_checkouts",
    "write_checkouts",
    "read_discounts",
    "write_discounts",
    "read_price_rules",
    "write_price_rules",
    "read_fulfillments",
    "write_fulfillments",
    "read_draft_orders",
    "write_draft_orders",
    "read_content",
    "write_content",
    "read_themes",
    "write_themes",
    "read_shopify_payments_payouts",
    "read_script_tags",
    "write_script_tags",
    "read_translations",
    "write_translations",
    "read_files",
    "write_files",
  ].join(", ");
  const clientId = "280818e662c2957ab13e5007b064455e";

  return `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}`;
};

const renderRows = (data) =>
  data.map((item) => [
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
      onClick={() =>
        window.open(`http://localhost:5173/bot/${item.botId}`, "_blank")
      }
    >
      View Bot
    </Button>,
  ]);

export default function Index() {
  const fetcher = useFetcher();
  const { session, data } = useLoaderData();
  const rows = data?.length > 0 ? renderRows(data) : [];

  return (
    <Page
      fullWidth
      title={rows.length > 0 ? "TomAI fetched data" : ""}
      subtitle={rows.length > 0 ? "Overview of all bots and installations" : ""}
    >
      <Button>Create a new bot</Button>
      {rows.length > 0 ? (
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
      ) : (
        <EmptyStateContent
          fetcher={fetcher}
          generateRegisterUrl={() => generateRegisterUrl(session.shop)}
        />
      )}
    </Page>
  );
}

function EmptyStateContent({ fetcher, generateRegisterUrl }) {
  return (
    <div
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderRadius: "12px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        paddingBottom: "20px",
        marginTop: "40px",
        margin: "40px",
        marginRight: "180px",
        marginLeft: "180px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div
        style={{
          borderWidth: "1px black",
          marginBottom: "10px",
          borderRadius: "15px",
          width: "95%",
          textAlign: "start",
          margin: "28px",
          background: "linear-gradient(135deg, #007bff, #28a745)",
          display: "flex",
          justifyContent: "center", // Center the image within the container
        }}
      >
        <img
          src="https://portal.tomai.vn/assets/thumnail_logo_sign_in-RyJpA-NT.png"
          alt="TomAI Logo"
          style={{
            marginTop: "15px",
            width: "80%", // Set width to 80% of the container for responsiveness
            maxWidth: "500px", // Max width ensures the image doesn't get too large
            height: "auto", // Maintain aspect ratio
          }}
        />
      </div>

      <MainContent
        fetcher={fetcher}
        generateRegisterUrl={generateRegisterUrl}
      />
    </div>
  );
}

function MainContent({ fetcher, generateRegisterUrl }) {
  return (
    <div style={{ padding: "20px", width: "100%", maxWidth: "900px" }}>
      <BlockStack gap="500">
        <BlockStack gap="200">
          <Text
            variant="headingMd"
            style={{
              color: "#333",
              fontSize: "64px",
              fontWeight: "bold",
              textAlign: "center",
              lineHeight: "1.2",
              marginBottom: "20px",
            }}
          >
            Welcome to TomAI 🎉
          </Text>
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
            Join TomAI today to start leveraging AI-driven chatbots that
            streamline customer support, increase engagement, and help grow your
            business. Our cutting-edge technology is designed to be intuitive
            and easy to use.
          </Text>
        </BlockStack>

        <InlineStack
          gap="300"
          style={{ justifyContent: "center", marginTop: "20px" }}
        >
          <Button
            variant="primary"
            style={{
              padding: "10px 20px",
              borderRadius: "15px",
              fontSize: "1rem",
              fontWeight: "bold",
              border: "1px solid #D8D8D8",
            }}
            onClick={() => window.open(generateRegisterUrl(), "_blank")}
          >
            Connect to TomAI
          </Button>
          <Button
            variant="secondary"
            style={{
              padding: "10px 20px",
              borderRadius: "15px",
              fontSize: "1rem",
              fontWeight: "bold",
              border: "1px solid #D8D8D8",
            }}
            onClick={() => window.open("https://tomai.vn/", "_blank")}
          >
            Learn More
          </Button>
        </InlineStack>

        {fetcher.data?.product && (
          <ProductDisplay product={fetcher.data.product} />
        )}
      </BlockStack>
    </div>
  );
}

function ProductDisplay({ product }) {
  return (
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
        <pre style={{ margin: 0, color: "#333", whiteSpace: "pre-wrap" }}>
          <code>{JSON.stringify(product, null, 2)}</code>
        </pre>
      </Box>
    </>
  );
}
