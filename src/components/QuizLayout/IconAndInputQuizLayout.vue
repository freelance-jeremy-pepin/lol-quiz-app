<template>
    <div class="full-width">
        <result-quiz
            v-if="quizStageStore.isQuizFinished"
            :number-questions="quizConfiguration.numberQuestions"
            :score="participant.score"
            :time="quizConfiguration.withStopWatch ? participant.completeTime : null"
            @play-again="$emit('play-again')"
            @view-history="$emit('view-history')"
        ></result-quiz>

        <q-card v-else>
            <q-card-section v-if="quizStageStore.isLoading" class="column items-center">
                <q-spinner color="primary" size="3em"></q-spinner>
            </q-card-section>

            <q-card-section v-else class="column items-center q-pa-md q-gutter-y-md">
                <slot name="image"></slot>

                <div>{{ participant.currentQuestionNumber }}/{{ quizConfiguration.numberQuestions }}</div>

                <div class="text-accent text-bold">Score: {{ participant.score }}</div>

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

                <q-btn
                    v-if="!quizStageStore.isDisplayAnswer"
                    :color="quizStageStore.isWrong ? 'negative' : 'primary'"
                    :disable="quizStageStore.isVerifyingAnswer"
                    class="full-width"
                    @click="$emit('verify-answer')"
                >
                    {{
                        quizStageStore.isWrong ? 'Wrong' : quizStageStore.isVerifyingAnswer ? 'Verifying...' : 'Verify'
                    }}
                </q-btn>

                <q-btn
                    v-if="quizStageStore.isAnswering || quizStageStore.isWrong"
                    class="full-width"
                    color="negative"
                    flat
                    @click="$emit('skip')"
                >
                    Skip
                </q-btn>
            </q-card-section>
        </q-card>

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
            v-if="!quizStageStore.isQuizFinished"
            :offset="[18, 18]"
            position="bottom-right"
        >
            <q-btn color="accent" fab icon="history" @click="$emit('view-history')" />
        </q-page-sticky>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import QuizStageStore from 'src/store/modules/QuizStageStore';
import QuizConfiguration from 'src/models/QuizConfiguration';
import Participant from 'src/models/Participant';
import ShortcutsQuiz from 'components/Quiz/ShortcutsQuiz.vue';
import StopWatch from 'components/Common/StopWatch.vue';
import { Time } from 'src/models/Time';
import ResultQuiz from 'components/Quiz/ResultQuiz.vue';

@Component({
    components: { ResultQuiz, StopWatch, ShortcutsQuiz },
})
export default class IconAndInputQuizLayout extends Vue {
    // region Props

    @Prop({ required: true }) participant!: Participant;

    @Prop({ required: true }) quizConfiguration!: QuizConfiguration;

    // endregion

    // region Data

    private answer: string = '';

    public $refs!: {
        answerInput: HTMLFormElement;
        stopWatch: HTMLFormElement;
    };

    // endregion

    // region Computed properties

    public get quizStageStore(): typeof QuizStageStore {
        return QuizStageStore;
    }

    // endregion

    // region Hooks

    // noinspection JSUnusedLocalSymbols
    private mounted() {
        window.addEventListener('keydown', this.onKeyPress);
    }

    // noinspection JSUnusedLocalSymbols
    private unmounted() {
        window.removeEventListener('keydown', this.onKeyPress);
    }

    // endregion

    // region Methods

    public getTime(): Time {
        return this.$refs.stopWatch.getTime;
    }

    public focusAnswerInput() {
        setTimeout(() => {
            if (this.$refs.answerInput) {
                this.$refs.answerInput.focus();
            }
        }, 20);
    }

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

    @Watch('$attrs.value')
    public onValueChanged(value: string) {
        this.answer = value;
    }

    // endregion
}
</script>
