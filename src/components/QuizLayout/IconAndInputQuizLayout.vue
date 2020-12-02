<template>
    <div class="full-width">
        <result-quiz
            v-if="quizStageStore.isQuizFinished && !isMultiplayer"
            :is-multiplayer="isMultiplayer"
            :score="player.score"
            :time="quizConfiguration.withStopWatch ? player.completeTime : null"
            :total-score="quizConfiguration.totalScore ? quizConfiguration.totalScore : quizConfiguration.quiz.scoreBasedOnQuestionNumber ? quizConfiguration.numberQuestions : null"
            @play-again="$emit('play-again')"
            @view-history="onModalToggleAnswersHistory"
        ></result-quiz>

        <leaderboard-multiplayer
            v-if="quizStageStore.isQuizFinished && isMultiplayer && room"
            :room="room"
            :winner-has-lowest-score="quizConfiguration.quiz.winnerHasTheLowestScore"
            :next-room="nextRoom"
            @view-history="(playerViewHistory) => onModalToggleAnswersHistory(playerViewHistory)"
            @play-again="$emit('play-again')"
        ></leaderboard-multiplayer>

        <div v-if="quizStageStore.isLoading" class="text-center">
            <q-spinner color="primary" size="3em"></q-spinner>
        </div>

        <div v-if="quizStageStore.isUnknownRoom" class="text-center text-bold text-negative">
            Room not found.
        </div>

        <div
            v-if="!quizStageStore.isQuizFinished && !quizStageStore.isLoading && !quizStageStore.isUnknownRoom"
            class="q-gutter-y-sm"
        >
            <card-with-title-and-action
                :action-color="quizStageStore.isWrong ? 'negative' : 'primary'"
                :action-disable="quizStageStore.isVerifyingAnswer"
                :action-label="quizConfiguration.quiz.onlyOneTry ? 'Next' : quizStageStore.isWrong ? 'Wrong' : quizStageStore.isVerifyingAnswer ? 'Verifying...' : 'Verify'"
                :title="quizConfiguration.quiz.name"
                @action="onVerifyAnswer"
            >
                <q-card-section class="column items-center q-pa-md q-gutter-y-md">
                    <slot name="image"></slot>

                    <div>{{ player.currentQuestionNumber }}/{{ quizConfiguration.numberQuestions }}</div>

                    <div class="text-secondary text-bold">Score: {{ player.score }}</div>

                    <q-input
                        v-if="!quizStageStore.isDisplayAnswer"
                        ref="answerInput"
                        v-model="answerGivenByPlayer"
                        autofocus
                        borderless
                        class="full-width"
                        label="Your answer"
                        outlined
                        @input="$emit('input', answerGivenByPlayer)"
                        @keydown.enter.stop="onVerifyAnswer"
                    ></q-input>
                </q-card-section>
            </card-with-title-and-action>

            <q-btn
                v-if="quizConfiguration.quiz.canSkipQuestion && (quizStageStore.isAnswering || quizStageStore.isWrong)"
                class="full-width"
                color="grey"
                flat
                @click="onSkip"
            >
                Skip
            </q-btn>
        </div>

        <list-answers-history
            v-model="modalAnswersHistory.display"
            :player="modalAnswersHistory.player"
            :quiz-configuration="quizConfiguration"
        >
            <template v-slot:left-side="props">
                <slot :index="props.index" name="icon-answer-history"></slot>
            </template>
        </list-answers-history>

        <table-answer-history
            v-if="isMultiplayer && room"
            v-model="modalAnswersAllHistories.display"
            :players="room.players"
            :quiz-configuration="quizConfiguration"
        >
            <template v-slot:left-side="props">
                <slot :index="props.index" name="icon-answer-history"></slot>
            </template>
        </table-answer-history>

        <q-page-sticky :offset="[18, 18]" position="bottom-left">
            <shortcuts-quiz :quiz="quizConfiguration.quiz"></shortcuts-quiz>
        </q-page-sticky>

        <q-page-sticky
            v-if="quizStageStore.isQuizFinished && isMultiplayer && room"
            :offset="[18, 18]"
            position="bottom-right"
        >
            <q-btn color="accent" fab icon="history" @click="onToggleModalAnswersAllHistories" />
        </q-page-sticky>

        <q-page-sticky
            v-if="quizConfiguration.quiz.secondsPerQuestion && !quizStageStore.isQuizFinished && !quizStageStore.isLoading"
            :offset="[18, 18]"
            position="top-right"
        >
            <count-down
                v-if="quizConfiguration.quiz.secondsPerQuestion"
                :time="timeRemaining"
            ></count-down>
        </q-page-sticky>

        <q-page-sticky
            v-if="isMultiplayer && room && !quizStageStore.isQuizFinished"
            :offset="[18, 18]"
            position="top-left"
        >
            <progress-quiz-multiplayer :room="room"></progress-quiz-multiplayer>
        </q-page-sticky>
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator';
import QuizStageStore from 'src/store/modules/QuizStageStore';
import ShortcutsQuiz from 'components/Quiz/ShortcutsQuiz.vue';
import StopWatch from 'components/Common/StopWatch.vue';
import { Time } from 'src/models/Time';
import ResultQuiz from 'components/Quiz/ResultQuiz.vue';
import QuizStore from 'src/store/modules/QuizStore';
import User from 'src/models/User';
import CardWithTitleAndAction from 'components/Common/CardWithTitleAndAction.vue';
import ProgressQuizMultiplayer from 'components/Multiplayer/ProgressQuizMultiplayer.vue';
import LeaderboardMultiplayer from 'components/Multiplayer/LeaderboardMultiplayer.vue';
import QuizMixin from 'src/mixins/quizMixin';
import ListAnswersHistory from 'components/AnswerHistory/ListAnswersHistory.vue';
import TableAnswerHistory from 'components/AnswerHistory/TableAnswerHistory.vue';
import CountDown from 'components/Common/CountDown.vue';

@Component({
    components: {
        CountDown,
        TableAnswerHistory,
        ListAnswersHistory,
        LeaderboardMultiplayer,
        ProgressQuizMultiplayer,
        CardWithTitleAndAction,
        ResultQuiz,
        StopWatch,
        ShortcutsQuiz,
    },
})
export default class IconAndInputQuizLayout extends Mixins(QuizMixin) {
    // region Data

    // endregion

    // region Computed properties

    /**
     * Store détenant l'état du quiz.
     */
    public get quizStageStore(): typeof QuizStageStore {
        return QuizStageStore;
    }

    // endregion

    // region Events handlers

    /**
     * Vérifie la réponse donnée par l'utilisateur.
     * @private
     */
    private onVerifyAnswer() {
        const answerIsCorrect = this.verifyAnswer();

        if (this.quizConfiguration.quiz.onlyOneTry) {
            this.$emit('answered', this.answerGivenByPlayer, this.currentQuizAnswer);

            this.focusAnswerInput();
        } else {
            QuizStageStore.setVerifyingAnswer();

            if (answerIsCorrect) {
                this.$emit('correct-answer');
            } else {
                QuizStageStore.setWrong();

                setTimeout(() => {
                    if (QuizStageStore.isWrong) {
                        QuizStageStore.setAnswering();
                    }
                }, 1000);
            }
        }
    }

    // endregion

    // region Watchers

    /**
     * Synchronise le v-model et this.answer.
     */
    @Watch('$attrs.value')
    public onValueChanged(value: string) {
        this.answerGivenByPlayer = value;
    }

    /**
     * Synchronise l'utilisateur et le joueur.
     */
    @Watch('me')
    public onMeChanged(me: User) {
        if (me) {
            QuizStore.setPlayer({
                ...QuizStore.player,
                userId: me.id,
            });
        }
    }

    /**
     * Lors du changement de l'état du quiz :
     *  - focus le champ de réponse en mode quiz,
     *  - démarre un nouveau quiz s'il était en mode de chargement.
     */
    @Watch('quizStageStore.stage', { deep: true })
    public onQuizStateChanged() {
        if (QuizStageStore.isAnswering) {
            this.focusAnswerInput();
        } else if (QuizStageStore.isQuizFinished) {
            if (this.quizConfiguration.withStopWatch) {
                const completeTime: Time = { ...this.$refs.stopWatch.getTime };
                this.player = { ...this.player, completeTime };
            }
        }
    }

    // endregion
}
</script>
