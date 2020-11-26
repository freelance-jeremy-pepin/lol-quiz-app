<template>
    <div>
        <q-item :class="`${backgroundColor} text-black`">
            <q-item-section avatar>
                <icon-item
                    :item="item"
                ></icon-item>
            </q-item-section>

            <q-item-section>
                <q-item-label class="text-bold">
                    <span v-if="isAnswering">???</span>
                    <span v-else>Answer: {{ quizAnswer.value }}</span>
                </q-item-label>

                <q-item-label>
                    <span v-if="playerAnswerHistory.skipped">(skipped)</span>
                </q-item-label>

                <q-item-label v-if="playerAnswerHistory.answers.length > 0">
                    Your answers:

                    <span
                        v-for="answer in playerAnswerHistory.answers"
                        :key="answer.id"
                        :class="answer.isRight ? 'text-positive' : 'text-negative'"
                        class="text-bold"
                    >
                        [{{ answer.value }}]
                    </span>
                </q-item-label>

                <q-item-label v-else-if="!isAnswering" class="text-italic">
                    You didn't even try!
                </q-item-label>
            </q-item-section>
        </q-item>

        <q-separator v-if="!isLast" color="black"></q-separator>
    </div>
</template>

<script lang="ts">
import { Prop, Vue } from 'vue-property-decorator';
import Component from 'vue-class-component';
import IconItem from 'components/Item/IconItem.vue';
import QuizAnswer from 'src/models/QuizAnswer';
import ItemLolApi from 'src/models/LolApi/ItemLolApi';
import PlayerAnswerHistory from 'src/models/PlayerAnswerHistory';

@Component({
    components: { IconItem },
})
export default class LineAnswerHistoryItem extends Vue {
    // region Props

    @Prop({ required: true }) quizAnswer!: QuizAnswer;

    @Prop({ required: true }) playerAnswerHistory!: PlayerAnswerHistory;

    @Prop({ required: true }) item!: ItemLolApi;

    @Prop({ required: true }) isAnswering!: boolean;

    @Prop({ required: true }) isLast!: boolean;

    // endregion

    // region Computed properties

    private get backgroundColor(): string {
        if (this.playerAnswerHistory.found) {
            return 'bg-green-2';
        }

        if (this.isAnswering) {
            return 'bg-yellow-2';
        }

        return 'bg-red-2';
    }

    // endregion
}
</script>
