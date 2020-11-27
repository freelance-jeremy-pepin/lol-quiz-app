import Vue from 'vue';
import Vuex from 'vuex';
import SocketStore from 'src/store/modules/Socket/SocketStore';
import UserSocketStore from 'src/store/modules/Socket/UserSocketStore';
import RoomSocketStore from 'src/store/modules/Socket/RoomSocketStore';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface StoreInterface {
}

Vue.use(Vuex);

const store = new Vuex.Store({
    modules: {
        socket: SocketStore,
        socketUser: UserSocketStore,
        socketRoom: RoomSocketStore,
    },
});

export default store;
