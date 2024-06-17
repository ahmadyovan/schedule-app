import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, set, get, update, Unsubscribe, remove, onValue } from "firebase/database";
import { getAuth, signOut } from "firebase/auth";
import {clientConfig} from '@/config';

const app = getApps().length ? getApp() : initializeApp(clientConfig);
const auth = getAuth();
const db = getDatabase();

export { app, auth, signOut, db, ref, set, get, onValue, update, remove };
export type { Unsubscribe };
  

