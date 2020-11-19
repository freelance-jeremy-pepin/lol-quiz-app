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
import ItemLolApiStore from 'src/store/modules/LolApi/ItemLolApiStore';
import ItemLolApi from 'src/models/LolApi/ItemLolApi';
import SelectQuiz from 'components/Quiz/SelectQuiz.vue';

@Component({
    components: { SelectQuiz, NameQuiz },
})
export default class NameQuizPage extends Vue {
    // region Computed properties

    private get items(): ItemLolApi[] | undefined {
        return ItemLolApiStore.itemsFilteredForQuiz;
    }

    private get numberQuestions(): number {
        return this.$route.query.numberQuestions ? parseInt(this.$route.query.numberQuestions.toString(), 10) : 0;
    }

    private get withStopWatch(): boolean {
        return this.$route.query.withStopWatch ? this.$route.query.withStopWatch.toString() === 'true' : false;
    }

    // endregion
}
</script>
