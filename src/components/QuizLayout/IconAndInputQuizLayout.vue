<template>
    <div class="full-width">
        <result-quiz
            v-if="quizStageStore.isQuizFinished && !isMultiplayer"
            :is-multiplayer="isMultiplayer"
            :number-questions="quizConfiguration.quiz.scoreBasedOnQuestionNumber ? quizConfiguration.numberQuestions : null"
            :score="player.score"
            :time="quizConfiguration.withStopWatch ? player.completeTime : null"
            @play-again="$emit('play-again')"
            @view-history="$emit('view-history')"
        ></result-quiz>

        <leaderboard-multiplayer
            v-if="quizStageStore.isQuizFinished && isMultiplayer && room"
            :room="room"
            :winner-has-lowest-score="quizConfiguration.quiz.winnerHasTheLowestScore"
            @view-history="(playerViewHistory) => $emit('view-history', playerViewHistory)"
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

        <q-page-sticky :offset="[18, 18]" position="bottom-left">
            <shortcuts-quiz :quiz="quizConfiguration.quiz"></shortcuts-quiz>
        </q-page-sticky>

        <q-page-sticky
            v-if="quizConfiguration.withStopWatch && !quizStageStore.isQuizFinished && !quizStageStore.isLoading"
            :offset="[18, 18]"
            position="top-right"
        >
            <stop-watch ref="stopWatch"></stop-watch>
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
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator';
import QuizStageStore from 'src/store/modules/QuizStageStore';
import QuizConfiguration from 'src/models/QuizConfiguration';
import Player from 'src/models/Player';
import ShortcutsQuiz from 'components/Quiz/ShortcutsQuiz.vue';
import StopWatch from 'components/Common/StopWatch.vue';
import { Time } from 'src/models/Time';
import ResultQuiz from 'components/Quiz/ResultQuiz.vue';
import QuizStore from 'src/store/modules/QuizStore';
import User from 'src/models/User';
import CardWithTitleAndAction from 'components/Common/CardWithTitleAndAction.vue';
import UserMixin from 'src/mixins/userMixin';
import SocketMixin from 'src/mixins/socketMixin';
import ProgressQuizMultiplayer from 'components/Multiplayer/ProgressQuizMultiplayer.vue';
import Room from 'src/models/Room';
import LeaderboardMultiplayer from 'components/Multiplayer/LeaderboardMultiplayer.vue';
import QuizAnswer from 'src/models/QuizAnswer';
import PlayerAnswer, { createDefaultPlayerAnswer } from 'src/models/PlayerAnswer';

@Component({
    components: {
        LeaderboardMultiplayer,
        ProgressQuizMultiplayer,
        CardWithTitleAndAction,
        ResultQuiz,
        StopWatch,
        ShortcutsQuiz,
    },
})
export default class IconAndInputQuizLayout extends Mixins(UserMixin, SocketMixin) {
    // region Props

    /**
     * Configuration du quiz.
     */
    @Prop({ required: true }) quizConfiguration!: QuizConfiguration;

    @Prop({ required: false, default: false, type: Boolean }) isMultiplayer!: boolean;

    // endregion

    // region Data

    /**
     * Réponse donnée par le jouer.
     */
    private answerGivenByPlayer: string = '';

    /**
     * Référence des composants enfants.
     */
    public $refs!: {
        answerInput: HTMLFormElement;
        stopWatch: HTMLFormElement;
    };

    // endregion

    // region Computed properties

    /**
     * Store détenant l'état du quiz.
     */
    public get quizStageStore(): typeof QuizStageStore {
        return QuizStageStore;
    }

    /**
     * Récupère le joueur du joueur.
     * @private
     */
    private get player(): Player {
        return QuizStore.player;
    }

    /**
     * Modifier le joueur du quiz.
     * @private
     */
    private set player(player: Player) {
        QuizStore.setPlayer(player);
    }

    private get room(): Room | undefined | null {
        if (this.isMultiplayer) {
            return this.roomSocketStore.room;
        }

        return undefined;
    }

    private get currentQuizAnswer(): QuizAnswer {
        return this.quizConfiguration.answers[this.player.currentQuestionNumber - 1];
    }

    // endregion

    // region Hooks

    // noinspection JSUnusedLocalSymbols
    /**
     * Lorsque le composant est monté, ajoute les raccourcis liés au quiz.
     */
    private mounted() {
        window.addEventListener('keydown', this.onKeyPress);
    }

    // noinspection JSUnusedLocalSymbols
    /**
     * Lorsque le composant est démonté, supprime les raccourcis liés au quiz.
     */
    private unmounted() {
        window.removeEventListener('keydown', this.onKeyPress);
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

    private onSkip() {
        this.updateLastAnswer(false, true);
        this.$emit('skip');
    }

    // endregion

    // region Methods

    /**
     * Focus sur le champs de réponse.
     */
    public focusAnswerInput() {
        setTimeout(() => {
            if (this.$refs.answerInput) {
                this.$refs.answerInput.focus();
            }
        }, 20);
    }

    /**
     * Ajoute les raccourcis liés au quiz.
     */
    private onKeyPress(e: KeyboardEvent) {
        if (QuizStageStore.isAnswering) {
            if (e.shiftKey && e.key === '/') {
                this.focusAnswerInput();
            }

            if (e.key === 'F9') {
                this.$emit('skip');
            }
        }

        if (QuizStageStore.isQuizFinished) {
            if (e.key === 'h') {
                this.$emit('toggle-history');
            }

            if (e.key === 'r') {
                setTimeout(() => {
                    this.$emit('play-again');
                }, 20);
            }
        }
    }

    /**
     * Vérifie la réponse donnée par le joueur.
     * @private
     */
    private verifyAnswer(): boolean {
        if (this.currentQuizAnswer) {
            // Garde seulement les caractère alphanumérique du nom de l'objet et de la réponse donnée par le joueur.
            // Si les 2 valeurs sont identiques, le joueur a donné la bonne réponse.
            const quizAnswer = this.currentQuizAnswer.value.replace(/[^a-z0-9]/gi, '').toLowerCase();
            const playerAnswer = this.answerGivenByPlayer.replace(/[^a-z0-9]/gi, '').toLowerCase();

            const answerIsRight = quizAnswer === playerAnswer;

            this.updateLastAnswer(answerIsRight, false);

            return answerIsRight;
        }

        return false;
    }

    /**
     * Met à jour la dernière réponse donnée par le joueur.
     * @param found L'objet a été trouvé.
     * @param skipped L'objet a été passé.
     * @private
     */
    private updateLastAnswer(found: boolean, skipped: boolean) {
        const lastAnswer = this.player.answersHistory[this.player.answersHistory.length - 1];
        lastAnswer.found = found;
        lastAnswer.skipped = skipped;

        if (this.answerGivenByPlayer.trim()) {
            const newAnswer: PlayerAnswer = createDefaultPlayerAnswer();
            newAnswer.value = this.answerGivenByPlayer.trim();
            newAnswer.isRight = found;
            lastAnswer.answers = [...lastAnswer.answers, newAnswer];
        }

        if (this.isMultiplayer && this.room) {
            this.updatePlayer();
        }
    }

    /**
     * Met à jour le joueur courant.
     */
    private updatePlayer() {
        if (this.room) {
            this.roomSocketStore.updatePlayer({
                room: this.room,
                player: this.player,
            });
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
