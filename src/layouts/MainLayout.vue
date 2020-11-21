<template>
    <q-layout view="lHh Lpr lFf" >
        <q-header elevated>
            <q-toolbar :class="$q.dark.isActive ? 'bg-grey-10' : 'bg-primary'">
                <q-toolbar-title class="cursor-pointer" @click="$router.push('/')">
                    LoL Quiz
                </q-toolbar-title>

                <q-btn v-if="user" flat>
                    {{ user.pseudo }}
                    <q-popup-edit v-model="pseudo" auto-save>
                        <q-input v-model="pseudo" autofocus dense/>
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
            <router-view/>
        </q-page-container>
    </q-layout>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import VersionLolApiStore from 'src/store/modules/LolApi/VersionLolApiStore';
import LoLApiItemsModule from 'src/store/modules/LolApi/ItemLolApiStore';
import ChampionLolApiStore from 'src/store/modules/LolApi/ChampionLolApiStore';
import UserStore from 'src/store/modules/UserStore';
import User from 'src/models/User';

@Component
export default class MainLayout extends Vue {
    // region Computed properties

    private get version(): string | undefined {
        return VersionLolApiStore.version;
    }

    private get user(): User | undefined {
        return UserStore.user;
    }

    private get pseudo(): string | undefined {
        return UserStore.user?.pseudo;
    }

    // noinspection JSUnusedLocalSymbols
    private set pseudo(pseudo: string | undefined) {
        if (pseudo && this.user) {
            UserStore.setUser({ id: this.user.id, pseudo });
        }
    }

    // endregion

    // Region Hooks

    // noinspection JSUnusedLocalSymbols
    private mounted() {
        UserStore.restoreUser()
        .then((user) => {
            if (!user) {
                UserStore.createNewUser();
            }
        });

        this.restoreDarkModeFromLocalStorage();

        VersionLolApiStore.fetchVersion()
        .then(() => {
            LoLApiItemsModule.fetchItems();
            ChampionLolApiStore.fetchChampions();
        })
        .catch((e) => {
            throw new Error(e);
        });
    }

    // endregion

    // region Events listeners

    private onToggleDarkMode() {
        this.$q.dark.toggle();

        this.saveDarkModeInLocalStorage();
    }

    // endregion

    // region Methods

    private restoreDarkModeFromLocalStorage() {
        this.$q.dark.set(this.$q.localStorage.getItem('darkMode') || false);
    }

    private saveDarkModeInLocalStorage() {
        this.$q.localStorage.set('darkMode', this.$q.dark.isActive);
    }

    // endregion
}
</script>
