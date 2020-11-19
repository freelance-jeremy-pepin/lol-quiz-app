import { io } from 'socket.io-client';
import VueSocketIOExt from 'vue-socket.io-extended';

export const socket = io('http://localhost:3000');

// eslint-disable-next-line @typescript-eslint/require-await
export default async ({ Vue, store }) => {
    Vue.use(VueSocketIOExt, socket, { store });
};
