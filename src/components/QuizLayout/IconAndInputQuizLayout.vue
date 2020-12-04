<template>
    <div class="full-width">
        <result-quiz
            v-if="quizStageStore.isQuizFinished && !isMultiplayer"
            :is-multiplayer="isMultiplayer"
            :score="player.score"
            :time="quizConfiguration.withStopWatch ? player.completeTime : null"
            :total-score="quizConfiguration.totalScore ? quizConfiguration.totalScore : quizConfiguration.quiz.scoreBasedOnQuestionNumber ? quizConfiguration.numberQuestions : null"
            @play-again="$emit('play-again')"
        ></result-quiz>

        <leaderboard-multiplayer
            v-if="quizStageStore.isQuizFinished && isMultiplayer && room"
            :next-room="nextRoom"
            :room="room"
            :winner-has-lowest-score="quizConfiguration.quiz.winnerHasTheLowestScore"
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
                @action="$emit('verify-answer')"
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
                        @keydown.enter.stop="$emit('verify-answer')"
                    ></q-input>
                </q-card-section>
            </card-with-title-and-action>

            <q-btn
                v-if="quizConfiguration.quiz.canSkipQuestion && (quizStageStore.isAnswering || quizStageStore.isWrong)"
                class="full-width"
                color="grey"
                flat
                @click="$emit('skip')"
            >
                Skip
            </q-btn>
        </div>

        <table-answer-history
            v-if="players.length > 0"
            v-model="displayPlayersAnswersHistories"
            :players="players"
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
            v-if="quizStageStore.isQuizFinished && players.length > 0"
            :offset="[18, 18]"
            position="bottom-right"
        >
            <q-btn color="accent" fab icon="history" @click="displayPlayersAnswersHistories = true" />
        </q-page-sticky>

        <q-page-sticky
            v-if="quizConfiguration.quiz.enableTimeRemaining && quizConfiguration.quiz.secondsPerQuestion && !quizStageStore.isQuizFinished && !quizStageStore.isLoading"
            :offset="[18, 18]"
            position="top-right"
        >
            <count-down
                v-if="quizConfiguration.quiz.secondsPerQuestion"
                :time="timeRemaining"
                only-seconds
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
import CountDown from 'components/Common/CountDown.vue';
import Player from 'src/models/Player';
import TableAnswerHistory from 'components/AnswerHistory/TableAnswerHistory.vue';
import Room from 'src/models/Room';
import QuizConfiguration from 'src/models/QuizConfiguration';
import SocketMixin from 'src/mixins/socketMixin';
import SecondsCountDown from 'components/Common/CountDown.vue';

@Component({
    components: {
        SecondsCountDown,
        TableAnswerHistory,
        CountDown,
        LeaderboardMultiplayer,
        ProgressQuizMultiplayer,
        CardWithTitleAndAction,
        ResultQuiz,
        StopWatch,
        ShortcutsQuiz,
    },
})
export default class IconAndInputQuizLayout extends Mixins(SocketMixin) {
    // region Computed properties

    /**
     * Récupère le joueur du quiz.
     * @private
     */
    private get player(): Player {
        return QuizStore.player;
    }

    private get isMultiplayer(): boolean {
        return QuizStore.isMultiplayer;
    }

    private get quizConfiguration(): QuizConfiguration {
        return QuizStore.quizConfiguration;
    }

    private get answerGivenByPlayer(): string {
        return QuizStore.answerGivenByPlayer;
    }

    private set answerGivenByPlayer(value: string) {
        QuizStore.setAnswerGivenByPlayer(value);
    }

    private get room(): Room | undefined | null {
        if (this.isMultiplayer) {
            return this.roomSocketStore.room;
        }

        return undefined;
    }

    private get nextRoom(): Room | null | undefined {
        if (this.room?.nextRoomId) {
            return this.roomSocketStore.rooms.find(r => r.id === this.room?.nextRoomId && !r.inGame);
        }

        return null;
    }

    private get timeRemaining(): Time {
        return QuizStore.timeRemaining;
    }

    private get displayPlayersAnswersHistories(): boolean {
        return QuizStore.displayPlayersAnswersHistories;
    }

    private set displayPlayersAnswersHistories(value: boolean) {
        QuizStore.setDisplayPlayersAnswersHistories(value);
    }

    /**
     * Store détenant l'état du quiz.
     */
    private get quizStageStore(): typeof QuizStageStore {
        return QuizStageStore;
    }

    private get players(): Player[] {
        if (this.isMultiplayer && this.room) {
            return this.room.players;
        }

        if (this.player) {
            return [this.player];
        }

        return [];
    }

    // endregion

    // region Computed properties

    public mounted() {
        QuizStore.setRefAnswerInput(this.$refs.answerInput);
    }

    // endregion

    // region Watchers

    /**
     * Synchronise l'utilisateur et le joueur.
     */
    @Watch('me')
    private onMeChanged(me: User) {
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
    private onQuizStateChanged() {
        if (QuizStageStore.isAnswering) {
            this.$emit('focus-answer-input');
        }
    }

    // endregion
}
</script>
