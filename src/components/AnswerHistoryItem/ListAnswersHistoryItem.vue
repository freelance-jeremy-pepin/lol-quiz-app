<template>
    <q-dialog v-model="$attrs.value" v-bind="$attrs" v-on="$listeners">
        <q-card style="max-width: 500px; width: 100%;">
            <q-list>
                <line-answer-history-item
                    v-for="(answerHistoryItem, index) in answersHistoryItemReversed"
                    :key="answerHistoryItem.id"
                    :answer-history-item="answerHistoryItem"
                    :is-last="index === answerHistoryItem.length - 1"
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
import Player from 'src/models/Player';

@Component({
    components: { LineAnswerHistoryItem },
})
// TODO: renommer, inclure la notion de Player(voir Props)
export default class ListAnswersHistoryItem extends Vue {
    // region Props

    @Prop({ required: true }) player!: Player;

    // endregion

    // region Computed properties

    private get answersHistoryItemReversed(): AnswerHistoryItem[] {
        return [...this.player.answersHistoryItem].reverse();
    }

    // endregion
}
</script>
