<template>
    <div class="column items-center" style="max-width: 300px; width: 100%;">
        <result-quiz
            v-if="quizStageModule.isQuizFinished"
            :number-questions="numberQuestions"
            :score="score"
            :time="time"
            @play-again="onStartNewQuiz"
            @view-history="historyIsVisible = true"
        ></result-quiz>

        <q-card
            v-else
            style="width: 100%;"
            @keydown.shift="onPickItem"
        >
            <q-card-section v-if="quizStageModule.isLoading" class="column items-center">
                <q-spinner color="primary" size="3em"></q-spinner>
            </q-card-section>

            <q-card-section v-else class="column items-center q-pa-md q-gutter-y-md">
                <icon-item v-if="item" :item="item" :with-tooltip="!quizStageModule.isAnswering"></icon-item>

                <span
                    v-if="quizStageModule.isDisplayAnswer"
                    class="text-bold"
                >
                    {{ item.name }}
                </span>

                <div v-if="!quizIsInfinite">{{ currentQuestion }}/{{ numberQuestions }}</div>
                <div>Score: {{ score }}</div>

                <q-input
                    v-if="!quizStageModule.isDisplayAnswer"
                    ref="answerInput"
                    v-model="answer"
                    autofocus
                    borderless
                    class="full-width"
                    label="Your answer"
                    outlined
                    @keydown.enter.stop="onVerifyAnswer"
                ></q-input>

                <q-btn
                    v-if="!quizStageModule.isDisplayAnswer"
                    :color="quizStageModule.isWrong ? 'negative' : 'primary'"
                    :disable="quizStageModule.isVerifyingAnswer"
                    class="full-width"
                    @click="onVerifyAnswer"
                >
                    {{
                        quizStageModule.isWrong ? 'Wrong' : quizStageModule.isVerifyingAnswer ? 'Verifying...' : 'Verify'
                    }}
                </q-btn>

                <q-btn v-else class="full-width" color="secondary" @click="onPickItem">
                    New item
                </q-btn>

                <q-btn
                    v-if="!numberQuestions && (quizStageModule.isAnswering || quizStageModule.isWrong)"
                    class="full-width"
                    color="primary"
                    outline
                    @click="onGiveAnswer"
                >
                    Ask answer
                </q-btn>

                <q-btn
                    v-if="numberQuestions && (quizStageModule.isAnswering || quizStageModule.isWrong)"
                    class="full-width"
                    color="negative"
                    outline
                    @click="onSkipItem"
                >
                    Skip
                </q-btn>
            </q-card-section>
        </q-card>

        <q-page-sticky
            v-if="withStopWatch && !quizStageModule.isQuizFinished && !quizStageModule.isLoading"
            :offset="[18, 18]"
            position="top-right"
        >
            <stop-watch ref="stopWatch"></stop-watch>
        </q-page-sticky>

        <q-page-sticky v-if="!quizStageModule.isQuizFinished" :offset="[18, 18]" position="bottom-right">
            <q-btn color="accent" fab icon="history" @click="historyIsVisible = true" />
        </q-page-sticky>

        <q-page-sticky :offset="[18, 18]" position="bottom-left">
            <shortcuts-quiz></shortcuts-quiz>
        </q-page-sticky>

        <answers-history-list v-model="historyIsVisible" :answers-history="answersHistory"></answers-history-list>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Item } from 'src/models/item';
import IconItem from 'components/Item/IconItem.vue';
import StopWatch from 'components/Common/StopWatch.vue';
import { copyToClipboard } from 'quasar';
import ResultQuiz from 'components/Quiz/ResultQuiz.vue';
import { Time } from 'src/const';
import { AnswerHistory } from 'src/models/answerHistory';
import AnswersHistoryList from 'components/AnswerHistory/AnswersHistoryList.vue';
import { random } from 'src/utils/random';
import ShortcutsQuiz from 'components/Quiz/ShortcutsQuiz.vue';
import QuizStageModule from 'src/store/modules/quiz-stage-module';

@Component({
    components: { ShortcutsQuiz, ResultQuiz, StopWatch, IconItem, AnswersHistoryList },
})
export default class NameQuiz extends Vue {
    // region Props

    @Prop({ required: true }) items!: Item[];

    @Prop({ required: false, default: false, type: Boolean }) withStopWatch!: boolean;

    @Prop({ required: true, default: null }) numberQuestions!: number;

    // endregion

    // region Data

    private item: Item | null = null;

    private itemsToFind: Item[] | null = null;

    private answer: string = '';

    private score: number = 0;

    private currentQuestion: number = 0;

    private time: Time | null = null;

    private answersHistory: AnswerHistory[] = [];

    private historyIsVisible: boolean = false;

    public $refs!: {
        answerInput: any;
        stopWatch: any;
    };

    // endregion

    // region Computed properties

    public get quizIsInfinite(): boolean {
        return this.numberQuestions === 0;
    }

    public get quizStageModule(): QuizStageModule {
        return QuizStageModule;
    }

    // endregion

    // region Hooks

    private mounted() {
        QuizStageModule.setLoading();

        window.addEventListener('keydown', this.onKeyPress);

        this.startNewQuiz();
    }

    private unmounted() {
        window.removeEventListener('keydown', this.onKeyPress);
    }

    // endregion

    // region Event handlers

    private onVerifyAnswer() {
        QuizStageModule.setVerifyingAnswer();

        if (this.verifyAnswer()) {
            if (!this.quizIsInfinite) {
                this.onPickItem();
            } else {
                QuizStageModule.setRight();
            }

            this.score += 1;
        } else {
            QuizStageModule.setWrong();

            setTimeout(() => {
                if (QuizStageModule.isWrong) {
                    QuizStageModule.setAnswering();
                }
            }, 1000);
        }
    }

    private onGiveAnswer() {
        this.giveAnswer();
    }

    private onPickItem() {
        this.pickItem();

        this.answer = '';

        this.focusAnswerInput();
    }

    private onSkipItem() {
        this.skipItem();
    }

    private onKeyPress(e: KeyboardEvent) {
        if (e.key === 'Enter' && (QuizStageModule.isAnswerGiven || QuizStageModule.isRight)) {
            this.onPickItem();
        }

        if (QuizStageModule.isAnswering) {
            if (e.shiftKey && e.key === '/') {
                this.focusAnswerInput();
            }

            if (e.key === 'F9') {
                this.onSkipItem();
            }
        }

        if (QuizStageModule.isQuizFinished) {
            if (e.key === 'h') {
                this.historyIsVisible = !this.historyIsVisible;
            }

            if (e.key === 'r') {
                setTimeout(() => {
                    this.onStartNewQuiz();
                }, 20);
            }
        }
    }

    private onStartNewQuiz() {
        this.startNewQuiz();
    }

    // endregion

    // region Methods

    private verifyAnswer(): boolean {
        if (this.item) {
            const itemName = this.item.name.replace(/[^a-z0-9]/gi, '').toLowerCase();
            const answer = this.answer.replace(/[^a-z0-9]/gi, '').toLowerCase();

            const answerIsRight = itemName === answer;

            this.updateLastAnswer(answerIsRight, false);

            return answerIsRight;
        }

        return false;
    }

    private giveAnswer() {
        QuizStageModule.setAnswerGiven();
    }

    private pickItem() {
        if (!this.quizIsInfinite && this.currentQuestion >= this.numberQuestions) {
            QuizStageModule.setQuizFinished();
            return;
        }

        if (!this.quizIsInfinite) {
            this.currentQuestion += 1;
            this.pickNextItem();
        } else {
            this.pickRandomItem();
        }

        this.addNewAnswerToHistory();

        QuizStageModule.setAnswering();

        if (process.env.NODE_ENV === 'development' && this.item) {
            copyToClipboard(this.item.name);
            console.log(`%c ${this.item.name}`, 'color: #bada55');
            console.log(this.item);
        }
    }

    private pickNextItem() {
        if (this.itemsToFind) {
            this.item = this.itemsToFind[this.currentQuestion - 1];
        }
    }

    private pickRandomItem() {
        const randomIndex = random(0, this.items.length - 1);
        this.item = this.items[randomIndex];
    }

    private skipItem() {
        this.updateLastAnswer(false, true);
        this.onPickItem();
    }

    private startNewQuiz() {
        this.resetQuiz();

        this.onPickItem();

        QuizStageModule.setAnswering();
    }

    private addNewAnswerToHistory() {
        const lastAnswer = this.answersHistory[this.answersHistory.length - 1];

        if (lastAnswer) {
            lastAnswer.isAnswering = false;
        }

        if (this.item) {
            this.answersHistory.push({
                id: new Date().getUTCMilliseconds(),
                item: this.item,
                found: false,
                answers: [],
                isAnswering: true,
                skipped: false,
            });
        }
    }

    private updateLastAnswer(found: boolean, skipped: boolean) {
        const lastAnswer = this.answersHistory[this.answersHistory.length - 1];
        lastAnswer.found = found;
        lastAnswer.skipped = skipped;

        if (skipped || found) {
            lastAnswer.isAnswering = false;
        }

        if (this.answer.trim()) {
            lastAnswer.answers = [...lastAnswer.answers, { id: new Date().getUTCMilliseconds(), isRight: found, answer: this.answer.trim() }];
        }
    }

    private resetQuiz() {
        this.currentQuestion = 0;
        this.score = 0;
        this.answersHistory = [];
        this.itemsToFind = [];

        if (!this.quizIsInfinite) {
            const itemsToPick = [...this.items];
            for (let i = 0; i < this.numberQuestions; i++) {
                const randomIndex = random(0, itemsToPick.length - 1);
                this.itemsToFind.push(itemsToPick[randomIndex]);
                itemsToPick.splice(randomIndex, 1);
            }
        }
    }

    private focusAnswerInput() {
        setTimeout(() => {
            if (this.$refs.answerInput) {
                this.$refs.answerInput.focus();
            }
        }, 20);
    }

    // endregion

    // region Watchers

    @Watch('quizStageModule.stage', { deep: true })
    public onQuizStateChanged() {
        if (QuizStageModule.isAnswering) {
            this.focusAnswerInput();
        } else if (QuizStageModule.isQuizFinished) {
            if (this.withStopWatch && this.$refs.stopWatch) {
                this.time = { ...this.$refs.stopWatch.getTime };
            }
        }
    }

    // endregion
}
</script>
