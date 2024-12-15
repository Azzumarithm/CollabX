import { collection, getDocs } from "firebase/firestore";
import { db, model } from "@/config/firebaseConfig";


// Initialize Firestore

// Function to fetch data from Firestore and pass it to Vertex AI
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

        // Convert the data to JSON string
        const jsonString = JSON.stringify(usersLogData, null, 2);

        // Create a prompt for Vertex AI
        const prompt = `Analyze the following user session log data and provide insights:\n\n${jsonString}`;

        // Call Vertex AI Gemini API with the prompt
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        console.log("Analysis from Vertex AI:", text);

    } catch (error) {
        console.error("Error fetching or processing data:", error);
    }
}