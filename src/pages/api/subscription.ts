import { supabase } from "@lib/supabase";
import type { APIRoute } from "astro";
const twitchClientId = import.meta.env.TWITCH_CLIENT_ID;
const twitchClientSecret = import.meta.env.TWITCH_CLIENT_SECRET;
const broadcasterId = import.meta.env.TWITCH_BROADCASTER_ID;

async function getTwitchAppAccessToken() {
  const tokenUrl = `https://id.twitch.tv/oauth2/token?client_id=${twitchClientId}&client_secret=${twitchClientSecret}&grant_type=client_credentials`;

  try {
    const response = await fetch(tokenUrl, { method: "POST" });
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Failed to get Twitch App Access Token:", error);
    return null;
  }
}

export const GET: APIRoute = async ({ request }) => {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const token = authHeader.split(" ")[1];
  const { data: userData, error: userError } =
    await supabase.auth.getUser(token);

  if (userError || !userData.user) {
    return new Response(
      JSON.stringify({ error: "Invalid token or user not found" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const twitchUserId = userData.user.user_metadata?.provider_id;
  if (!twitchUserId) {
    return new Response(
      JSON.stringify({ error: "Twitch user ID not found in user metadata" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const appAccessToken = await getTwitchAppAccessToken();
  if (!appAccessToken) {
    return new Response(
      JSON.stringify({ error: "Could not retrieve Twitch API token" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const subscriptionCheckUrl = `https://api.twitch.tv/helix/subscriptions/user?broadcaster_id=${broadcasterId}&user_id=${twitchUserId}`;

  try {
    const twitchResponse = await fetch(subscriptionCheckUrl, {
      headers: {
        "Client-ID": twitchClientId,
        Authorization: `Bearer ${appAccessToken}`,
      },
    });

    if (twitchResponse.status === 200) {
      const subscriptionData = await twitchResponse.json();
      return new Response(
        JSON.stringify({
          isSubscribed: true,
          subscription: subscriptionData.data[0],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    if (twitchResponse.status === 404) {
      return new Response(
        JSON.stringify({ isSubscribed: false, subscription: null }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    const errorBody = await twitchResponse.text();
    return new Response(
      JSON.stringify({
        error: "Failed to check subscription",
        details: errorBody,
      }),
      {
        status: twitchResponse.status,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
