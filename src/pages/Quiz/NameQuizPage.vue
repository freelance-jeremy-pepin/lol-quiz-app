<template>
    <q-page class="q-pa-md row items-center justify-evenly" style="margin-top: 16px;">
        <name-quiz
            v-if="items"
            :items="items"
            :number-questions="numberQuestions"
            :with-stop-watch="withStopWatch"
        ></name-quiz>
    </q-page>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import NameQuiz from 'components/Quiz/NameQuiz.vue';
import LolApiItemsModule from 'src/store/modules/lol-api/lol-api-items-module';
import { Item } from 'src/models/item';
import SelectQuiz from 'components/Quiz/SelectQuiz.vue';

@Component({
    components: { SelectQuiz, NameQuiz },
})
export default class NameQuizPage extends Vue {
    // region Computed properties

    private get items(): Item[] | undefined {
        return LolApiItemsModule.itemsFilteredForQuiz;
    }

    private get numberQuestions(): number {
        if (typeof this.$route.query.numberQuestions === 'string') {
            return parseInt(this.$route.query.numberQuestions, 10);
        }

        return 0;
    }

    private get withStopWatch(): boolean {
        if (typeof this.$route.query.withStopWatch === 'string') {
            return this.$route.query.withStopWatch === '1';
        }

        return false;
    }

    // endregion
}
</script>
