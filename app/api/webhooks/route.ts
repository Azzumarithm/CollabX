import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error(
      "Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET);

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", {
      status: 400,
    });
  }

  // Get body
  const payload = await req.json();
  console.log("Raw Payload:", JSON.stringify(payload, null, 2));
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error: Could not verify webhook:", err);
    return new Response("Error: Verification error", {
      status: 400,
    });
  }

  // Do something with payload
  // For this guide, log payload to console
  const { id } = evt.data;

  const eventType = evt.type;
  const userLogRef = doc(db, "users_log", id);

  try {
    if (eventType === "session.created") {
      // Store session data when a new session is created
      const { user_id } = evt.data;

      await setDoc(userLogRef, {
        abandonAt: evt.data.abandon_at,
        clientId: evt.data.client_id,
        createdAt: evt.data.created_at,
        expireAt: evt.data.expire_at,
        id: evt.data.id,
        lastActiveAt: evt.data.last_active_at,
        object: evt.data.object,
        status: evt.data.status,
        updatedAt: evt.data.updated_at,
        userId: evt.data.user_id,
        clientIp: evt["event_attributes"]["http_request"]["client_ip"],
        userAgent: evt["event_attributes"]["http_request"]["user_agent"],
      });
      console.log(`Session created for user: ${user_id}`);
    } else if (
      eventType === "session.ended" ||
      eventType === "session.removed"
    ) {
      // Update session status when a session ends
      const { user_id } = evt.data;
      await setDoc(
        userLogRef,
        {
          abandonAt: evt.data.abandon_at,
          clientId: evt.data.client_id,
          createdAt: evt.data.created_at,
          expireAt: evt.data.expire_at,
          id: evt.data.id,
          lastActiveAt: evt.data.last_active_at,
          object: evt.data.object,
          status: evt.data.status,
          updatedAt: evt.data.updated_at,
          userId: evt.data.user_id,
          clientIp: evt["event_attributes"]["http_request"]["client_ip"],
          userAgent: evt["event_attributes"]["http_request"]["user_agent"],
        },
        { merge: true }
      );
      console.log(`Session ended for user: ${user_id}`);
    } else if (eventType === "session.revoked") {
      // Delete session data when a session is removed or revoked
      await deleteDoc(userLogRef);
      console.log(`Session revoked for user`);
    }

    return new Response("Webhook received and processed", { status: 200 });
  } catch (error) {
    console.error("Error updating Firestore:", error);
    return new Response("Error processing webhook", { status: 500 });
  }

  return new Response("Webhook received", { status: 200 });
}
