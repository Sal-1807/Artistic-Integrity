import PocketBase from 'pocketbase';
import { Storage } from '@/lib/database';

export const pb = new PocketBase('http://192.168.137.1:8090/');

// Restore auth on app start
export const restoreAuth = async () => {
  const cookie = await Storage.getItem('pb_auth');
  if (cookie) {
    pb.authStore.loadFromCookie(cookie);
  }
};
