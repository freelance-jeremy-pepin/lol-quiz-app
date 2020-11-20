<template>
    <q-page class="q-pa-md row items-center justify-evenly" style="margin-top: 16px;">
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
    </q-page>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import ItemLolApiStore from 'src/store/modules/LolApi/ItemLolApiStore';
import ItemLolApi from 'src/models/LolApi/ItemLolApi';
import SelectQuiz from 'components/Quiz/SelectQuiz.vue';
import { Time } from 'src/const';
import AnswerHistory from 'src/models/AnswerHistory';
import QuizStageStore from 'src/store/modules/QuizStageStore';
import { copyToClipboard } from 'quasar';
import { randomNumber, uniqueID } from 'src/utils/randomNumber';
import ResultQuiz from 'components/Quiz/ResultQuiz.vue';
import IconItem from 'components/Item/IconItem.vue';
import AnswersHistoryList from 'components/AnswerHistory/AnswersHistoryList.vue';
import ShortcutsQuiz from 'components/Quiz/ShortcutsQuiz.vue';
import StopWatch from 'components/Common/StopWatch.vue';

@Component({
    components: { StopWatch, ShortcutsQuiz, AnswersHistoryList, IconItem, ResultQuiz, SelectQuiz },
})
export default class ItemNameQuizPage extends Vue {
    // region Computed properties

    private get items(): ItemLolApi[] | undefined {
        return ItemLolApiStore.itemsFilteredForQuiz;
    }

    private get numberQuestions(): number {
        return this.$route.query.numberQuestions ? parseInt(this.$route.query.numberQuestions.toString(), 10) : 0;
    }

    private get withStopWatch(): boolean {
        return this.$route.query.withStopWatch ? this.$route.query.withStopWatch.toString() === 'true' : false;
    }

    // endregion

    // region Data

    private item: ItemLolApi | null = null;

    private itemsToFind: ItemLolApi[] | null = null;

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

    public get quizStageModule(): typeof QuizStageStore {
        return QuizStageStore;
    }

    // endregion

    // region Hooks

    private beforeCreate() {
        QuizStageStore.setLoading();

        window.addEventListener('keydown', this.onKeyPress);
    }

    private unmounted() {
        window.removeEventListener('keydown', this.onKeyPress);
    }

    // endregion

    // region Event handlers

    private onVerifyAnswer() {
        QuizStageStore.setVerifyingAnswer();

        if (this.verifyAnswer()) {
            if (!this.quizIsInfinite) {
                this.onPickItem();
            } else {
                QuizStageStore.setRight();
            }

            this.score += 1;
        } else {
            QuizStageStore.setWrong();

            setTimeout(() => {
                if (QuizStageStore.isWrong) {
                    QuizStageStore.setAnswering();
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
        if (e.key === 'Enter' && (QuizStageStore.isAnswerGiven || QuizStageStore.isRight)) {
            this.onPickItem();
        }

        if (QuizStageStore.isAnswering) {
            if (e.shiftKey && e.key === '/') {
                this.focusAnswerInput();
            }

            if (e.key === 'F9') {
                this.onSkipItem();
            }
        }

        if (QuizStageStore.isQuizFinished) {
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
        if (this.item?.name) {
            const itemName = this.item.name.replace(/[^a-z0-9]/gi, '').toLowerCase();
            const answer = this.answer.replace(/[^a-z0-9]/gi, '').toLowerCase();

            const answerIsRight = itemName === answer;

            this.updateLastAnswer(answerIsRight, false);

            return answerIsRight;
        }

        return false;
    }

    private giveAnswer() {
        QuizStageStore.setAnswerGiven();
    }

    private pickItem() {
        if (!this.quizIsInfinite && this.currentQuestion >= this.numberQuestions) {
            QuizStageStore.setQuizFinished();
            return;
        }

        if (!this.quizIsInfinite) {
            this.currentQuestion += 1;
            this.pickNextItem();
        } else {
            this.pickRandomItem();
        }

        this.addNewAnswerToHistory();

        QuizStageStore.setAnswering();

        if (process.env.NODE_ENV === 'development' && this.item?.name) {
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
        const randomIndex = randomNumber(0, this.items.length - 1);
        this.item = this.items[randomIndex];
    }

    private skipItem() {
        this.updateLastAnswer(false, true);
        this.onPickItem();
    }

    private startNewQuiz() {
        this.resetQuiz();

        this.onPickItem();

        QuizStageStore.setAnswering();
    }

    private addNewAnswerToHistory() {
        const lastAnswer = this.answersHistory[this.answersHistory.length - 1];

        if (lastAnswer) {
            lastAnswer.isAnswering = false;
        }

        if (this.item) {
            this.answersHistory.push({
                id: uniqueID(),
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
                const randomIndex = randomNumber(0, itemsToPick.length - 1);
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

    @Watch('items', { immediate: true, deep: true })
    public onItemsChanged(items: ItemLolApi[]) {
        if (QuizStageStore.isLoading && items) {
            this.startNewQuiz();
        }
    }

    @Watch('quizStageModule.stage', { deep: true })
    public onQuizStateChanged() {
        if (QuizStageStore.isAnswering) {
            this.focusAnswerInput();
        } else if (QuizStageStore.isQuizFinished) {
            if (this.withStopWatch && this.$refs.stopWatch) {
                this.time = { ...this.$refs.stopWatch.getTime };
            }
        }
    }

    // endregion
}
</script>
