<template>
    <q-page class="q-pa-md row items-center justify-evenly" style="margin-top: 16px;">
        <name-quiz v-if="items" :items="items"></name-quiz>
    </q-page>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import NameQuiz from 'components/Quiz/NameQuiz.vue';
import LolApiVersionModule from 'src/store/modules/lol-api/lol-api-version-module';
import LolApiItemsModule from 'src/store/modules/lol-api/lol-api-items-module';
import { Item } from 'src/models/item';

@Component({
    components: { NameQuiz },
})
export default class PageIndex extends Vue {
    // region Computed properties

    private get version(): string | undefined {
        return LolApiVersionModule.version;
    }

    private get items(): Item[] | undefined {
        return LolApiItemsModule.items;
    }

    // endregion
}
</script>
