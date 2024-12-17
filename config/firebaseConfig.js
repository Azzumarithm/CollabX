// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithCustomToken } from 'firebase/auth'
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirestore } from 'firebase/firestore'
import { getVertexAI, getGenerativeModel } from "firebase/vertexai-preview"; 
import {FunctionDeclarationSchemaType} from "@google/generative-ai"
// Initialize the Vertex AI service and the generative model

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)
export const auth = getAuth(app)

export const functions = getFunctions(app);

// Initialize the Vertex AI service
export const vertexAI = getVertexAI(app);

// Initialize the generative model with a model that supports your use case
// Gemini 2.0 
const schema = {
  type: FunctionDeclarationSchemaType.OBJECT,
  properties: {
    userID: {
      type: FunctionDeclarationSchemaType.STRING,
      nullable: false,
    },
    mean_lastActiveAt: {
      type: FunctionDeclarationSchemaType.NUMBER,
      nullable: false,
    },
    std_lastActiveAt: {
      type: FunctionDeclarationSchemaType.NUMBER,
      nullable: false,
    },
    z_scores: {
      type: FunctionDeclarationSchemaType.ARRAY,
      items: {
        type: FunctionDeclarationSchemaType.OBJECT,
        properties: {
          lastActiveAt: {
            type: FunctionDeclarationSchemaType.NUMBER,
            nullable: false,
          },
          z_score: {
            type: FunctionDeclarationSchemaType.NUMBER,
            nullable: false,
          },
        },
        required: ["lastActiveAt", "z_score"],
      },
      nullable: false,
    },
    anomaly_status: {
      type: FunctionDeclarationSchemaType.STRING,
      nullable: false,
    },
  },
  required: [
    "userID",
    "mean_lastActiveAt",
    "std_lastActiveAt",
    "z_scores",
    "anomaly_status",
  ],
};

export const model = getGenerativeModel(vertexAI, {
  model: "gemini-2.0-flash-exp", tools: [
    {
      codeExecution: {},
    },
  ],
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: schema,
  },
})



