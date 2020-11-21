<template>
    <q-layout view="lHh Lpr lFf">
        <q-header elevated>
            <q-toolbar :class="$q.dark.isActive ? 'bg-grey-10' : 'bg-primary'">
                <q-toolbar-title class="cursor-pointer" @click="$router.push('/')">
                    LoL Quiz
                </q-toolbar-title>

                <q-btn v-if="me" flat>
                    {{ me.pseudo }}
                    <q-popup-edit v-model="pseudo" auto-save>
                        <q-input v-model="pseudo" autofocus dense />
                    </q-popup-edit>
                </q-btn>

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
            <router-view />
        </q-page-container>
    </q-layout>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator';
import VersionLolApiStore from 'src/store/modules/LolApi/VersionLolApiStore';
import LoLApiItemsModule from 'src/store/modules/LolApi/ItemLolApiStore';
import ChampionLolApiStore from 'src/store/modules/LolApi/ChampionLolApiStore';
import UserStore from 'src/store/modules/UserStore';
import User from 'src/models/User';
import SocketMixin from 'src/mixins/socketMixin';

@Component
export default class MainLayout extends Mixins(SocketMixin) {
    // region Computed properties

    private get version(): string | undefined {
        return VersionLolApiStore.version;
    }

    private get me(): User | undefined {
        return UserStore.me;
    }

    private get pseudo(): string | undefined {
        return UserStore.me?.pseudo;
    }

    // noinspection JSUnusedLocalSymbols
    private set pseudo(pseudo: string | undefined) {
        if (pseudo && this.me) {
            UserStore.setMe({ id: this.me.id, pseudo });
        }
    }

    // endregion

    // Region Hooks

    // noinspection JSUnusedLocalSymbols
    private mounted() {
        setInterval(() => {
            // console.log(socket.connected);
        });
        this.userSocketStore.getAllUsers();

        this.restoreMe();

        this.restoreDarkModeFromLocalStorage();

        this.fetchItems();
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
                    UserStore.createNewGuest();
                }
            });
    }

    private fetchItems() {
        VersionLolApiStore.fetchVersion()
            .then(() => {
                LoLApiItemsModule.fetchItems();
                ChampionLolApiStore.fetchChampions();
            })
            .catch((e) => {
                throw new Error(e);
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
    @Watch('socketStore.isConnected', { immediate: true })
    public onSocketIsConnectedChanged() {
        this.sendMeToServer();
    }

    /**
     * Lorsque l'utilisateur a changé, envoi l'utilisateur courant au serveur.
     */
    @Watch('me', { immediate: true })
    public onMeChanged() {
        this.sendMeToServer();
    }

    // endregion
}
</script>
