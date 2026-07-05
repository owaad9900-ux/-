import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase with auto-provisioned configuration
const app = initializeApp(firebaseConfig);

// Initialize Firestore with the correct database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export default app;
