<template>
    <q-layout view="lHh Lpr lFf">
        <q-header elevated>
            <q-toolbar>
                <q-toolbar-title class="cursor-pointer" @click="$router.push('/')">
                    LoL Quiz items
                </q-toolbar-title>

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
import { Component, Vue } from 'vue-property-decorator';
import LolApiVersionModule from 'src/store/modules/lol-api/lol-api-version-module';
import LoLApiItemsModule from 'src/store/modules/lol-api/lol-api-items-module';

@Component
export default class MainLayout extends Vue {
    // region Computed properties

    private get version(): string | undefined {
        return LolApiVersionModule.version;
    }

    // endregion

    // Region Hooks

    private mounted() {
        this.restoreDarkModeFromLocalStorage();

        LolApiVersionModule.fetchVersion()
            .then(() => {
                LoLApiItemsModule.fetchItems();
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
