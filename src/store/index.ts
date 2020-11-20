import Vue from 'vue';
import Vuex from 'vuex';
import Socket from 'src/store/modules/SocketStore';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface StoreInterface {
}

Vue.use(Vuex);

const store = new Vuex.Store({
    modules: {
        socket: Socket,
    },
});

export default store;
