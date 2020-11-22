<template>
    <div class="full-width">
        <result-quiz
            v-if="quizStageStore.isQuizFinished"
            :is-multiplayer="isMultiplayer"
            :number-questions="quizConfiguration.numberQuestions"
            :score="participant.score"
            :time="quizConfiguration.withStopWatch ? participant.completeTime : null"
            @play-again="$emit('play-again')"
            @view-history="$emit('view-history')"
        ></result-quiz>

        <div v-else-if="quizStageStore.isLoading" class="text-center">
            <q-spinner color="primary" size="3em"></q-spinner>
        </div>

        <div v-else-if="quizStageStore.isUnknownRoom" class="text-center text-bold text-negative">
            Room does not exists!
        </div>

        <div v-else class="q-gutter-y-sm">
            <card-with-title-and-action
                :action-color="quizStageStore.isWrong ? 'negative' : 'primary'"
                :action-disable="quizStageStore.isVerifyingAnswer"
                :action-label="quizStageStore.isWrong ? 'Wrong' : quizStageStore.isVerifyingAnswer ? 'Verifying...' : 'Verify'"
                @action="$emit('verify-answer')"
            >
                <q-card-section class="column items-center q-pa-md q-gutter-y-md">
                    <slot name="image"></slot>

                    <div>{{ participant.currentQuestionNumber }}/{{ quizConfiguration.numberQuestions }}</div>

                    <div class="text-secondary text-bold">Score: {{ participant.score }}</div>

                    <q-input
                        v-if="!quizStageStore.isDisplayAnswer"
                        ref="answerInput"
                        v-model="answer"
                        autofocus
                        borderless
                        class="full-width"
                        label="Your answer"
                        outlined
                        @input="$emit('input', answer)"
                        @keydown.enter.stop="$emit('verify-answer')"
                    ></q-input>
                </q-card-section>
            </card-with-title-and-action>

            <q-btn
                v-if="quizStageStore.isAnswering || quizStageStore.isWrong"
                class="full-width"
                color="grey"
                flat
                @click="$emit('skip')"
            >
                Skip
            </q-btn>
        </div>

        <q-page-sticky :offset="[18, 18]" position="bottom-left">
            <shortcuts-quiz></shortcuts-quiz>
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

        <q-page-sticky
            v-if="!quizStageStore.isQuizFinished"
            :offset="[18, 18]"
            position="bottom-right"
        >
            <q-btn
                color="accent" fab icon="history"
                @click="$emit('view-history')"
            />
        </q-page-sticky>
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator';
import QuizStageStore from 'src/store/modules/QuizStageStore';
import QuizConfiguration from 'src/models/QuizConfiguration';
import Participant from 'src/models/Participant';
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

@Component({
    components: {
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
     * Réponse donnée par le participant.
     */
    private answer: string = '';

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
     * Récupère le participant du quiz.
     * @private
     */
    private get participant(): Participant {
        return QuizStore.participant;
    }

    /**
     * Modifier le participant du quiz.
     * @private
     */
    private set participant(participant: Participant) {
        QuizStore.setParticipant(participant);
    }

    private get room(): Room | undefined | null {
        if (this.isMultiplayer) {
            return this.roomSocketStore.room;
        }

        return undefined;
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

    // endregion

    // region Watchers

    /**
     * Synchronise le v-model et this.answer.
     */
    @Watch('$attrs.value')
    public onValueChanged(value: string) {
        this.answer = value;
    }

    /**
     * Synchronise l'utilisateur et le participant.
     */
    @Watch('me')
    public onMeChanged(me: User) {
        if (me) {
            QuizStore.setParticipant({
                ...QuizStore.participant,
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
                this.participant = { ...this.participant, completeTime };
            }
        }
    }

    // endregion
}
</script>
