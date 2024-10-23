import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Text,
  Button,
  BlockStack,
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
  console.log("session", session.shop);
  console.log("request", session);

  const bots = await db.bot.findMany({
    where: { sessionId: session.id },
  });
  const shopDetails = await fetchShopDetails(session);
  // const activeThemeId = await fetchActiveThemeId(session);
  // if (activeThemeId) {
  //   console.log("Active Theme ID:", activeThemeId);
  // } else {
  //   console.log("Failed to retrieve the active theme ID");
  // }
  if (!shopDetails || shopDetails.errors) {
    return json(emptyShopResponse(session));
  }

  return json({
    shopId: shopDetails.data.shop.id,
    // themeId: activeThemeId,
    data: bots,
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
const fetchActiveThemeId = async (session) => {
  const response = await fetch(
    `https://${session.shop}/admin/api/2023-10/themes.json`,
    {
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": session.accessToken,
        "Content-Type": "application/json",
      },
    },
  );
  if (!response.ok) {
    console.error("Failed to fetch themes:", response.statusText);
    return null;
  }
  const { themes } = await response.json();

  // Find the active theme (main theme)
  const activeTheme = themes.find((theme) => theme.role === "main");
  if (!activeTheme) {
    console.log("No active theme found");
    return null;
  }

  console.log("Active theme ID:", activeTheme.id);
  return activeTheme.id;
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
  // const { admin } = await authenticate.admin(request);
  // console.log("Admin authenticated:", admin);
};

const generateRegisterUrl = (shop) => {
  const redirectUri = import.meta.env.VITE_SHOPIFY_REDIRECT_URL
  // const redirectUri =
  //   "https://called-gathering-adapted-personality.trycloudflare.com/auth/callback";
  const scope = import.meta.env.VITE_SHOPIFY_SCOPES;
  const clientId = import.meta.env.VITE_SHOPIFY_API_KEY;
  console.log(redirectUri, clientId, scope);
  return `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}`;
};

const renderRows = (data) =>
  data.map((item) => [
    <Text key={item.id} variation="strong">
      {item.id}
    </Text>,
    item.botType,
    item.botToken,
    format(new Date(item.createdAt), "PPP"),
    format(new Date(item.updatedAt), "PPP"),
    item.isActive ? (
      <Badge status="success">Installed</Badge>
    ) : (
      <Badge status="warning">Not Installed</Badge>
    ),
    <Button
      key={`view-${item.botId}`}
      onClick={() => {
        let url = import.meta.env.VITE_EXTERNAL_FRONT_END_URL;
        return window.open(`${url}/bot/${item.botId}`, "_blank");
      }}
    >
      View Bot
    </Button>,
  ]);

export default function Index() {
  // const fetcher = useFetcher();
  const { session, data } = useLoaderData();
  const rows = data?.length > 0 ? renderRows(data) : [];

  return (
    <Page
      fullWidth
      title={rows.length > 0 ? "TomAI Bots Overview" : "Welcome to TomAI"}
      subtitle={rows.length > 0 ? "Overview of all bots and installations" : ""}
    >
      <div
        style={{
          paddingBottom: "20px",
        }}
      >
        <InlineStack gap="3" spacing="extraTight" align="start">
          {rows.length > 0 && <Button primary>Create a new bot</Button>}
        </InlineStack>
      </div>

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
              "text",
            ]}
            headings={[
              "ID",
              "Type",
              "Bot Key",
              "Created At",
              "Updated At",
              "Status",
              "Actions",
            ]}
            rows={rows}
            footerContent={`Total Bots: ${rows.length}`}
          />
        </LegacyCard>
      ) : (
        <EmptyStateContent
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
      </BlockStack>
    </div>
  );
}
