<template>
    <div>
        <q-item :class="`${backgroundColor} text-black`">
            <q-item-section avatar>
                <slot name="left-side"></slot>
            </q-item-section>

            <q-item-section>
                <q-item-label class="text-bold">
                    <span v-if="isAnswering">???</span>
                    <span v-else>Answer: {{ quizAnswer.value }}</span>
                </q-item-label>

                <q-item-label v-if="playerAnswerHistory.skipped">
                    <span>(skipped)</span>
                </q-item-label>

                <q-item-label v-if="playerAnswerHistory.score !== undefined">
                    <span v-if="playerAnswerHistory.score !== undefined">Score: {{ playerAnswerHistory.score }}</span>
                    <span v-if="playerAnswerHistory.totalScore"> / {{ playerAnswerHistory.totalScore }}</span>
                    <span v-if="answerIsPerfect(playerAnswerHistory)">
                        <q-badge
                            class="q-ml-xs"
                            color="yellow"
                            text-color="yellow-10"
                        >
                            Perfect!
                        </q-badge>
                    </span>
                </q-item-label>

                <q-item-label v-if="!isAnswering && playerAnswerHistory.found && playerAnswerHistory.timeElapsed">
                    <span>Time: {{ playerAnswerHistory.timeElapsed | transformTimeIntoString }}</span>
                </q-item-label>

                <q-item-label v-if="playerAnswerHistory.answers.length > 0">
                    Your {{ playerAnswerHistory.answers.length | pluralize('answer', 'answers') }}:

                    <span
                        v-for="answer in playerAnswerHistory.answers"
                        :key="answer.id"
                    >
                        <span
                            :class="answer.isRight !== null ? answer.isRight ? 'text-positive' : 'text-negative' : ''"
                            class="text-bold"
                        >
                            [{{ answer.value }}]
                        </span>
                        <span
                            v-if="false && quiz.answersAreOnlyNumber"
                            class="text-italic"
                        >
                            {{ difference(answer.value, quizAnswer.value) }}
                        </span>
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
import { Mixins, Prop } from 'vue-property-decorator';
import Component from 'vue-class-component';
import IconItem from 'components/Item/IconItem.vue';
import QuizAnswer from 'src/models/QuizAnswer';
import PlayerAnswerHistory from 'src/models/PlayerAnswerHistory';
import Quiz from 'src/models/Quiz';
import TextFormatMixin from 'src/mixins/textFormatMixin';
import { stringToInt } from 'src/utils/number';
import TimeMixin from 'src/mixins/timeMixin';
import PlayerAnswerMixin from 'src/mixins/playerAnswerMixin';

@Component({
    components: { IconItem },
})
export default class LineAnswerHistory extends Mixins(TextFormatMixin, TimeMixin, PlayerAnswerMixin) {
    // region Props

    @Prop({ required: true }) quiz!: Quiz;

    @Prop({ required: true }) quizAnswer!: QuizAnswer;

    @Prop({ required: true }) playerAnswerHistory!: PlayerAnswerHistory;

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

    // region Methods

    private difference(playerAnswer: string, quizAnswer: string): string {
        const difference: number = stringToInt(playerAnswer) - stringToInt(quizAnswer);

        if (difference > 0) {
            return `(+${difference})`;
        }
        if (difference === 0) {
            return '';
        }

        return `(${difference.toString()})`;
    }

    // endregion
}
</script>
