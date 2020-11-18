import Vue from 'vue';
import Vuex, { Store } from 'vuex';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface StoreInterface {
}

Vue.use(Vuex);

const debug = !!process.env.DEV;

const store: Store<StoreInterface> = new Store<StoreInterface>({
    state: {},
    strict: debug,
});

export default store;
