import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyDKPAqdnGoT4Lu_5P2YDPt1Q_NWeQf4biI",
  authDomain: "tasker-olzhas.firebaseapp.com",
  databaseURL: "https://tasker-olzhas-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "tasker-olzhas",
  storageBucket: "tasker-olzhas.firebasestorage.app",
  messagingSenderId: "523574181641",
  appId: "1:523574181641:web:92690877c99851257a1dd8",
  measurementId: "G-QFYZLCJK37"
}

const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)
export const storage = getStorage(app)
