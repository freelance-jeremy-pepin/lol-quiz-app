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
                <div v-if="versionLolApi">LoL API v. {{ versionLolApi }}</div>
            </q-toolbar>
        </q-header>

        <q-page-container>
            <router-view v-if="Object.values(loadings).every(loading => loading === false)" />

            <div v-if="isError" class="text-negative">An error occurred.</div>
        </q-page-container>
    </q-layout>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator';
import VersionLolApiStore from 'src/store/modules/LolApi/VersionLolApiStore';
import ChampionLolApiStore from 'src/store/modules/LolApi/ChampionLolApiStore';
import UserStore from 'src/store/modules/UserStore';
import SocketMixin from 'src/mixins/socketMixin';
import PseudoUser from 'components/User/PseudoUser.vue';
import UserMixin from 'src/mixins/userMixin';
import User from 'src/models/User';
import ItemLolApiStore from 'src/store/modules/LolApi/ItemLolApiStore';
import RuneLolApiStore from 'src/store/modules/LolApi/RuneLolApiStore';

@Component({
    components: { PseudoUser },
})
export default class MainLayout extends Mixins(UserMixin, SocketMixin) {
    // region Data

    /**
     * Chargements des différents éléments nécessaires à l'affichage de la page.
     */
    private loadings: { me: boolean, version: boolean, items: boolean, champions: boolean, runes: boolean } = {
        me: true,
        version: true,
        items: true,
        champions: true,
        runes: true,
    };

    // TODO: traiter et tester cas d'erreur.
    /**
     * Erreur de la récupération d'un élément.
     */
    private isError: boolean = false;

    // endregion

    // region Computed properties

    /**
     * Version de l'API.
     */
    private get versionLolApi(): string | undefined {
        return VersionLolApiStore.version;
    }

    // endregion

    // Region Hooks

    // noinspection JSUnusedLocalSymbols
    /**
     * Lorsque que le composant est monté, récupère tous les éléments nécessaires à l'affichage de la page.
     */
    private mounted() {
        this.loadings = { me: true, version: true, items: true, champions: true, runes: true };
        this.isError = false;

        this.userSocketStore.getAllUsers();

        this.restoreMe();

        this.restoreDarkModeFromLocalStorage();

        this.fetchDataLolApi();
    }

    // endregion

    // region Events listeners

    /**
     * Alterne entre le mode clair et le mode sombre.
     */
    private onToggleDarkMode() {
        this.$q.dark.toggle();

        this.saveDarkModeInLocalStorage();
    }

    // endregion

    // region Methods

    /**
     * Restaure l'utilisateur courant.
     */
    private restoreMe() {
        UserStore.restoreMe()
            .then((user) => {
                // Si l'utilisateur courant n'a pas pu être récupérer car il n'existe pas, créer un invité.
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

    /**
     * Récupère les informations liées à l'API LoL.
     */
    private fetchDataLolApi() {
        VersionLolApiStore.fetchVersion()
            .then(() => {
                this.fetchItemsLolApi();
                this.fetchChampionsLolApi();
                this.fetchRunesLolApi();
            })
            .catch((e) => {
                this.isError = true;
                throw new Error(e);
            })
            .finally(() => {
                this.loadings.version = false;
            });
    }

    /**
     * Récupère les objets de l'API LoL.
     */
    private fetchItemsLolApi() {
        ItemLolApiStore.fetchItems()
            .catch((e) => {
                this.isError = true;
                throw new Error(e);
            })
            .finally(() => {
                this.loadings.items = false;
            });
    }

    /**
     * Récupère les champions de l'API LoL.
     */
    private fetchChampionsLolApi() {
        ChampionLolApiStore.fetchChampions()
            .catch((e) => {
                this.isError = true;
                throw new Error(e);
            })
            .finally(() => {
                this.loadings.champions = false;
            });
    }

    /**
     * Récupère les runes de l'API LoL.
     */
    private fetchRunesLolApi() {
        RuneLolApiStore.fetchRunes()
            .catch((e) => {
                this.isError = true;
                throw new Error(e);
            })
            .finally(() => {
                this.loadings.runes = false;
            });
    }

    /**
     * Restaure l'état du mode sombre sombre stocké dans le local storage.
     */
    private restoreDarkModeFromLocalStorage() {
        this.$q.dark.set(this.$q.localStorage.getItem('darkMode') || false);
    }

    /**
     * Sauvegarde l'état du mode sombre stocké dans le local storage.
     */
    private saveDarkModeInLocalStorage() {
        this.$q.localStorage.set('darkMode', this.$q.dark.isActive);
    }

    /**
     * Envoi l'utilisateur courant au serveur afin qu'il le diffuse aux autres utilisateurs.
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
