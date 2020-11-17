<template>
    <q-layout style="background-color: #EEEEEE" view="lHh Lpr lFf">
        <q-header elevated>
            <q-toolbar>
                <q-toolbar-title @click="$router.push('/')" class="cursor-pointer">
                    LoL Quiz items
                </q-toolbar-title>

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
        LolApiVersionModule.fetchVersion()
            .then(() => {
                LoLApiItemsModule.fetchItems();
            })
            .catch((e) => {
                throw new Error(e);
            });
    }

    // endregion
}
</script>
