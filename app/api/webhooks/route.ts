import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { db, model } from "@/config/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

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
  // console.log("Raw Payload:", JSON.stringify(payload, null, 2));
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
      await fetchAndAnalyzeData();
      return new Response("Webhook received and processed", { status: 200 });
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
      await fetchAndAnalyzeData();

      return new Response("Webhook received and processed", { status: 200 });
    } else if (eventType === "session.revoked") {
      // Delete session data when a session is removed or revoked
      await fetchAndAnalyzeData();
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

// Delay function to introduce delays between API calls
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Retry logic to handle rate limit errors
const generateContentWithRetry = async (prompt, retries = 3) => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      if (error.customErrorData?.status === 429 && attempt < retries - 1) {
        console.warn(`Rate limit exceeded. Retrying in ${
          (attempt + 1) * 1000
        }ms...);
        await delay((attempt + 1) * 1000); // Exponential backoff
        attempt++;`);
      } else {
        throw error; // Re-throw if max retries are reached
      }
    }
  }
};

// Main function to fetch and analyze data
export async function fetchAndAnalyzeData() {
  try {
    // Fetch documents from the users_log collection
    const usersLogCollection = collection(db, "users_log");
    const querySnapshot = await getDocs(usersLogCollection);

    // Extract and format the data
    const usersLogData = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();

      usersLogData.push({
        abandonAt: data.abandonAt,
        clientId: data.clientId,
        createdAt: data.createdAt,
        expireAt: data.expireAt,
        id: data.id,
        lastActiveAt: data.lastActiveAt,
        object: data.object,
        status: data.status,
        updatedAt: data.updatedAt,
        userId: data.userId,
        clientIp: data.clientIp,
        userAgent: data.userAgent,
      });
    });

    if (usersLogData.length > 0) {
      // Convert the data to JSON string
      const jsonString = JSON.stringify(usersLogData, null, 2);

      // Combined prompt for anomaly detection and table creation
      // const prompts = {
      //   filter1:
      //   `I want you to do these tasks:
      //   1) Create the relevant fields such as userId, createdAt, lastActiveAt, AbandonAt, status, clientIp, userAgent:\n\n${jsonString}
      //   2) Create a table for the dataset in markdown format.`,
      //   filter2:
      //   `Generate results for the calculations based on the dataset and then give me the results in JSON format for a specific user ID:
      //   1) Step 1: Calculate the mean and standard deviation of the lastActiveAt column for every User ID based on the data in the dataset.
      //   2) Step 2: Calculate the Z-score for each data point using the formula: Z-score = (data point - mean) / standard deviation. Give me the results of the Z-score for all the data points in the dataset.
      //   3) Step 3: Set a threshold: Typically, data points with a Z-score greater than 3 or less than -3 are considered outliers.
      //   4) If there are no anomalies detected, type 'Normal' otherwise 'User ID Flagged`
      // }
      const combinedPrompts = `I want you to do these tasks:
      1) Create the relevant fields such as userId, createdAt, lastActiveAt, AbandonAt, status, clientIp, userAgent:\n\n${jsonString}
      2) Create a table for the dataset in markdown format.

      Generate results for the calculations based on the dataset and then give me the results in JSON format for all the users based on their User ID:

      3) Step 1: Calculate the mean and standard deviation of the lastActiveAt column for every User ID based on the data in the dataset.
      4) Step 2: Calculate the Z-score for each data point using the formula: Z-score = (data point - mean) / standard deviation. Give me the results of the Z-score for all the data points in the dataset.
      5) Step 3: Set a threshold: Typically, data points with a Z-score greater than 3 or less than -3 are considered outliers.
      6) Step 4: If the Z-score is greater for each lastActiveAt data point is greater than 3 or less than -3, type 'User ID Flagged' otherwise 'Normal'`

      // Generate content with retry logic

      const combinedResponse = await generateContentWithRetry(combinedPrompts);
      console.log(combinedResponse);
    }

    // TODO: Save the analysis results to Firestore or take further action
  } catch (error) {
    console.error("Error fetching or processing data:", error);
  }
}
