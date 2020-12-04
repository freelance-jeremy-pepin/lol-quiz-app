<template>
    <q-item v-if="playerAnswerHistory" :class="`${backgroundColor} text-black`">
        <q-item-section avatar>
            <slot :index="questionNumber" name="left-side"></slot>
        </q-item-section>

        <q-item-section>
            <q-item-label class="text-bold">
                <span v-if="playerIsCurrentQuestion">???</span>
                <span v-else>Answer: {{ quizAnswer.value }}</span>
            </q-item-label>

            <q-item-label v-if="playerAnswerHistory.skipped">
                <span>(skipped)</span>
            </q-item-label>

            <q-item-label v-if="playerAnswerHistory.score !== undefined">
                <span v-if="playerAnswerHistory.found && playerAnswerHistory.score !== undefined">Score: {{ playerAnswerHistory.score }}</span>
                <span v-if="playerAnswerHistory.totalScore"> / {{ playerAnswerHistory.totalScore }}</span>
                <span v-if="answerIsPerfect">
                    <q-badge
                        class="q-ml-xs"
                        color="yellow"
                        text-color="yellow-10"
                    >
                        Perfect!
                    </q-badge>
                </span>
            </q-item-label>

            <q-item-label v-if="!playerIsCurrentQuestion && playerAnswerHistory.found && playerAnswerHistory.timeElapsed">
                <span>Time: {{ playerAnswerHistory.timeElapsed | transformTimeIntoString }}</span>
            </q-item-label>

            <q-item-label v-if="playerAnswerHistory.answers.length > 0">
                <span v-if="player.userId === me.id">
                    Your
                </span>
                <span v-else>
                    {{ getPseudoById(player.userId) }}'s
                </span>
                {{ playerAnswerHistory.answers.length | pluralize('answer', 'answers') }}:

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
                </span>
            </q-item-label>
        </q-item-section>
    </q-item>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import PlayerAnswerHistory from 'src/models/PlayerAnswerHistory';
import Player from 'src/models/Player';
import PlayerMixin from 'src/mixins/playerMixin';
import TextFormatMixin from 'src/mixins/textFormatMixin';
import TimeMixin from 'src/mixins/timeMixin';
import QuizAnswer from 'src/models/QuizAnswer';
import UserMixin from 'src/mixins/userMixin';

@Component
export default class extends Mixins(PlayerMixin, TextFormatMixin, TimeMixin, UserMixin) {
    // region Props

    @Prop({ required: true }) player!: Player;

    @Prop({ required: true }) playerAnswerHistory!: PlayerAnswerHistory;

    @Prop({ required: true }) quizAnswer!: QuizAnswer;

    @Prop({ required: true }) questionNumber!: number;

    // endregion

    // region Computed properties

    private get backgroundColor(): string {
        if (this.playerAnswerHistory.found) {
            return 'bg-green-2';
        }

        if (!this.player.hasFinished && this.player.currentQuestionNumber === this.questionNumber + 1) {
            return 'bg-yellow-2';
        }

        return 'bg-red-2';
    }

    private get answerIsPerfect(): boolean {
        return (this.playerAnswerHistory.found && this.playerAnswerHistory.totalScore !== 0 && this.playerAnswerHistory.score === this.playerAnswerHistory.totalScore && this.playerAnswerHistory.answers.length === 1)
            || (this.playerAnswerHistory.found && this.playerAnswerHistory.totalScore === 0 && this.playerAnswerHistory.answers.length === 1 && this.playerAnswerHistory.found);
    }

    private get playerIsCurrentQuestion() {
        return this.player.currentQuestionNumber === this.questionNumber + 1 && !this.player.hasFinished;
    }

    // endregion
}
</script>
