// app/utils/firebaseConfig.ts
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyDz7RBxYDbzICG1-Zb9pst6FyviQHWDidQ",
  authDomain: "livechatapp-43a32.firebaseapp.com",
  projectId: "livechatapp-43a32",
  storageBucket: "livechatapp-43a32.appspot.com",
  messagingSenderId: "669798872334",
  appId: "1:669798872334:web:e7349da14d87d8381f935f"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)