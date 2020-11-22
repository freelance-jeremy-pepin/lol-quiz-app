<template>
    <q-dialog v-model="$attrs.value" v-bind="$attrs" v-on="$listeners">
        <q-card style="max-width: 500px; width: 100%;">
            <q-list>
                <line-answer-history-item
                    v-for="(answerHistoryItem, index) in answersHistoryItemReversed"
                    :key="answerHistoryItem.id"
                    :answer-history-item="answerHistoryItem"
                    :is-last="index === answersHistoryItem.length - 1"
                ></line-answer-history-item>
            </q-list>
        </q-card>
    </q-dialog>
</template>

<script lang="ts">
import { Prop, Vue } from 'vue-property-decorator';
import Component from 'vue-class-component';
import AnswerHistoryItem from 'src/models/AnswerHistoryItem';
import LineAnswerHistoryItem from 'components/AnswerHistoryItem/LineAnswerHistoryItem.vue';

@Component({
    components: { LineAnswerHistoryItem },
})
export default class AnswersHistoryList extends Vue {
    // region Props

    @Prop({ required: true }) answersHistoryItem!: AnswerHistoryItem[];

    // endregion

    // region Computed properties

    private get answersHistoryItemReversed(): AnswerHistoryItem[] {
        return [...this.answersHistoryItem].reverse();
    }

    // endregion
}
</script>
