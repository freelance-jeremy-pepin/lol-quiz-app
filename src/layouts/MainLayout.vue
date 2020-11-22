<template>
    <q-layout view="lHh Lpr lFf">
        <q-header elevated>
            <q-toolbar :class="$q.dark.isActive ? 'bg-grey-10' : 'bg-primary'">
                <q-toolbar-title class="cursor-pointer" @click="$router.push('/')">
                    LoL Quiz
                </q-toolbar-title>

                <pseudo-user></pseudo-user>

                <q-btn
                    :icon="$q.dark.isActive ? 'brightness_5' : 'brightness_4'"
                    class="q-mr-md"
                    flat
                    @click="onToggleDarkMode"
                ></q-btn>
                <div v-if="version">LoL API v. {{ version }}</div>
            </q-toolbar>
        </q-header>

        <q-page-container>
            <router-view v-if="Object.values(loadings).every(loading => loading === false)" />
        </q-page-container>
    </q-layout>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator';
import VersionLolApiStore from 'src/store/modules/LolApi/VersionLolApiStore';
import LoLApiItemsModule from 'src/store/modules/LolApi/ItemLolApiStore';
import ChampionLolApiStore from 'src/store/modules/LolApi/ChampionLolApiStore';
import UserStore from 'src/store/modules/UserStore';
import SocketMixin from 'src/mixins/socketMixin';
import PseudoUser from 'components/User/PseudoUser.vue';
import UserMixin from 'src/mixins/userMixin';
import User from 'src/models/User';

@Component({
    components: { PseudoUser },
})
export default class MainLayout extends Mixins(UserMixin, SocketMixin) {
    // region Data

    private loadings: { me: boolean, version: boolean, items: boolean, champions: boolean } = {
        me: true,
        version: true,
        items: true,
        champions: true,
    };

    private isError: boolean = false;

    // endregion

    // region Computed properties

    private get version(): string | undefined {
        return VersionLolApiStore.version;
    }

    // endregion

    // Region Hooks

    // noinspection JSUnusedLocalSymbols
    private mounted() {
        this.loadings = { me: true, version: true, items: true, champions: true };
        this.isError = false;

        this.userSocketStore.getAllUsers();

        this.restoreMe();

        this.restoreDarkModeFromLocalStorage();

        this.fetchDataLolApi();
    }

    // endregion

    // region Events listeners

    private onToggleDarkMode() {
        this.$q.dark.toggle();

        this.saveDarkModeInLocalStorage();
    }

    // endregion

    // region Methods

    private restoreMe() {
        UserStore.restoreMe()
            .then((user) => {
                if (!user) {
                    UserStore.createNewGuest()
                        .catch(() => {
                            this.isError = true;
                        })
                        .finally(() => {
                            this.loadings.me = false;
                        });
                }
            })
            .catch(() => {
                this.isError = true;
            })
            .finally(() => {
                // Si le restoreMe a fonctionné.
                if (this.me.id) {
                    this.loadings.me = false;
                }
            });
    }

    private fetchDataLolApi() {
        VersionLolApiStore.fetchVersion()
            .then(() => {
                this.fetchItems();
                this.fetchChampions();
            })
            .catch((e) => {
                this.isError = true;
                throw new Error(e);
            })
            .finally(() => {
                this.loadings.version = false;
            });
    }

    private fetchItems() {
        LoLApiItemsModule.fetchItems()
            .catch((e) => {
                this.isError = true;
                throw new Error(e);
            })
            .finally(() => {
                this.loadings.items = false;
            });
    }

    private fetchChampions() {
        ChampionLolApiStore.fetchChampions()
            .catch((e) => {
                this.isError = true;
                throw new Error(e);
            })
            .finally(() => {
                this.loadings.champions = false;
            });
    }

    private restoreDarkModeFromLocalStorage() {
        this.$q.dark.set(this.$q.localStorage.getItem('darkMode') || false);
    }

    private saveDarkModeInLocalStorage() {
        this.$q.localStorage.set('darkMode', this.$q.dark.isActive);
    }

    /**
     * Envoi l'utilisateur courant au serveur.
     */
    private sendMeToServer() {
        if (this.socketStore.isConnected && this.me) {
            this.userSocketStore.createOrUpdateUser(this.me);
        }
    }

    // endregion

    // region Watchers

    /**
     * Lorsque le serveur est connecté, envoi son l'utilisateur courant au serveur.
     */
    @Watch('socketStore.isConnected')
    public onSocketIsConnectedChanged() {
        this.sendMeToServer();
    }

    /**
     * Lorsque l'utilisateur a changé, envoi l'utilisateur courant au serveur.
     */
    @Watch('me')
    public onMeChanged(me: User, oldMe: User | undefined) {
        if (me.id !== oldMe?.id || me.pseudo !== oldMe?.pseudo) {
            this.sendMeToServer();
        }
    }

    // endregion
}
</script>
