import { io } from 'socket.io-client';
import VueSocketIOExt from 'vue-socket.io-extended';

let server = 'http://192.168.28.252:3000';

if (!process.env.DEBUGGING) {
    server = 'http://192.168.28.252:3000';
}

export const socket = io(server);

// eslint-disable-next-line @typescript-eslint/require-await
export default async ({ Vue, store }) => {
    Vue.use(VueSocketIOExt, socket, { store });
};
