<template>
    <q-page class="q-pa-md row items-center justify-evenly" style="margin-top: 16px;">
        <div class="column items-center" style="max-width: 300px; width: 100%;">
            <result-quiz
                v-if="quizStageStore.isQuizFinished"
                :number-questions="quizConfiguration.numberQuestions"
                :score="participant.score"
                :time="quizConfiguration.withStopWatch ? participant.completeTime : null"
                @play-again="onStartNewQuiz"
                @view-history="historyIsVisible = true"
            ></result-quiz>

            <icon-and-input-quiz-layout
                v-show="!quizStageStore.isLoading && !quizStageStore.isQuizFinished"
                ref="quiz"
                v-model="answer"
                :participant="participant"
                :quiz-configuration="quizConfiguration"
                v-on:skip="onSkipItem"
                v-on:verify-answer="onVerifyAnswer"
            >
                <template v-slot:image>
                    <icon-item
                        v-if="currentItem"
                        :item="currentItem"
                        :with-tooltip="!quizStageStore.isAnswering"
                    ></icon-item>
                </template>
            </icon-and-input-quiz-layout>

            <answers-history-list
                v-model="historyIsVisible"
                :answers-history="participant.answersHistory"
            ></answers-history-list>

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
                <q-btn color="accent" fab icon="history" @click="historyIsVisible = true" />
            </q-page-sticky>

            <q-page-sticky :offset="[18, 18]" position="bottom-left">
                <shortcuts-quiz></shortcuts-quiz>
            </q-page-sticky>
        </div>
    </q-page>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import ItemLolApiStore from 'src/store/modules/LolApi/ItemLolApiStore';
import ItemLolApi from 'src/models/LolApi/ItemLolApi';
import SelectQuiz from 'components/Quiz/SelectQuiz.vue';
import QuizStageStore from 'src/store/modules/QuizStageStore';
import { copyToClipboard } from 'quasar';
import { randomNumber, uniqueID } from 'src/utils/randomNumber';
import ResultQuiz from 'components/Quiz/ResultQuiz.vue';
import IconItem from 'components/Item/IconItem.vue';
import AnswersHistoryList from 'components/AnswerHistory/AnswersHistoryList.vue';
import ShortcutsQuiz from 'components/Quiz/ShortcutsQuiz.vue';
import StopWatch from 'components/Common/StopWatch.vue';
import IconAndInputQuizLayout from 'components/QuizLayout/IconAndInputQuizLayout.vue';
import Participant, { createDefaultParticipant } from 'src/models/Participant';
import QuizConfiguration, { createDefaultQuizConfiguration } from 'src/models/QuizConfiguration';
import UserStore from 'src/store/modules/UserStore';

@Component({
    components: {
        IconAndInputQuizLayout,
        StopWatch,
        ShortcutsQuiz,
        AnswersHistoryList,
        IconItem,
        ResultQuiz,
        SelectQuiz,
    },
})
export default class ItemNameQuizPage extends Vue {
    // region Computed properties

    private get items(): ItemLolApi[] | undefined {
        return ItemLolApiStore.itemsFilteredForQuiz;
    }

    // endregion

    // region Data

    private participant: Participant = createDefaultParticipant();

    private quizConfiguration: QuizConfiguration = createDefaultQuizConfiguration();

    private currentItem: ItemLolApi | null = null;

    private itemsToFind: ItemLolApi[] | null = null;

    private answer: string = '';

    private historyIsVisible: boolean = false;

    public $refs!: {
        quiz: HTMLFormElement;
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
    private beforeCreate() {
        QuizStageStore.setLoading();

        window.addEventListener('keydown', this.onKeyPress);
    }

    // noinspection JSUnusedLocalSymbols
    private mounted() {
        this.initQuizConfiguration();
        this.initParticipant();
    }

    // noinspection JSUnusedLocalSymbols
    private unmounted() {
        window.removeEventListener('keydown', this.onKeyPress);
    }

    // endregion

    // region Event handlers

    private onVerifyAnswer() {
        QuizStageStore.setVerifyingAnswer();

        if (this.verifyAnswer()) {
            this.participant.score += 1;

            this.onPickItem();
        } else {
            QuizStageStore.setWrong();

            setTimeout(() => {
                if (QuizStageStore.isWrong) {
                    QuizStageStore.setAnswering();
                }
            }, 1000);
        }
    }

    private onPickItem() {
        this.pickItem();

        this.answer = '';

        this.$refs.quiz.focusAnswerInput();
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
                this.$refs.quiz.focusAnswerInput();
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

    private initQuizConfiguration() {
        this.quizConfiguration = {
            ...this.quizConfiguration,
            numberQuestions: this.$route.query.numberQuestions ? parseInt(this.$route.query.numberQuestions.toString(), 10) : 5,
            withStopWatch: this.$route.query.withStopWatch ? this.$route.query.withStopWatch.toString() === 'true' : false,
        };
    }

    private initParticipant() {
        if (UserStore.user) {
            this.participant = {
                ...this.participant,
                user: UserStore.user,
            };
        }
    }

    private verifyAnswer(): boolean {
        if (this.currentItem?.name) {
            const itemName = this.currentItem.name.replace(/[^a-z0-9]/gi, '').toLowerCase();
            const answer = this.answer.replace(/[^a-z0-9]/gi, '').toLowerCase();

            const answerIsRight = itemName === answer;

            this.updateLastAnswer(answerIsRight, false);

            return answerIsRight;
        }

        return false;
    }

    private pickItem() {
        if (this.participant.currentQuestionNumber >= this.quizConfiguration.numberQuestions) {
            QuizStageStore.setQuizFinished();
            return;
        }
        this.participant.currentQuestionNumber += 1;
        this.pickNextItem();

        this.addNewAnswerToHistory();

        QuizStageStore.setAnswering();

        if (process.env.NODE_ENV === 'development' && this.currentItem?.name) {
            copyToClipboard(this.currentItem.name);

            // eslint-disable-next-line no-console
            console.log(`%c ${this.currentItem.name}`, 'color: #bada55', this.currentItem);
        }
    }

    private pickNextItem() {
        if (this.itemsToFind) {
            this.currentItem = this.itemsToFind[this.participant.currentQuestionNumber - 1];
        }
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
        const lastAnswer = this.participant.answersHistory[this.participant.answersHistory.length - 1];

        if (lastAnswer) {
            lastAnswer.isAnswering = false;
        }

        if (this.currentItem) {
            this.participant.answersHistory.push({
                id: uniqueID(),
                item: this.currentItem,
                found: false,
                answers: [],
                isAnswering: true,
                skipped: false,
            });
        }
    }

    private updateLastAnswer(found: boolean, skipped: boolean) {
        const lastAnswer = this.participant.answersHistory[this.participant.answersHistory.length - 1];
        lastAnswer.found = found;
        lastAnswer.skipped = skipped;

        if (skipped || found) {
            lastAnswer.isAnswering = false;
        }

        if (this.answer.trim()) {
            lastAnswer.answers = [...lastAnswer.answers, {
                id: new Date().getUTCMilliseconds(),
                isRight: found,
                answer: this.answer.trim(),
            }];
        }
    }

    private resetQuiz() {
        this.participant.currentQuestionNumber = 0;
        this.participant.score = 0;
        this.participant.answersHistory = [];
        this.itemsToFind = [];

        if (this.items) {
            const itemsToPick: ItemLolApi[] = [...this.items];
            for (let i = 0; i < this.quizConfiguration.numberQuestions; i++) {
                const randomIndex = randomNumber(0, itemsToPick.length - 1);
                this.itemsToFind.push(itemsToPick[randomIndex]);
                itemsToPick.splice(randomIndex, 1);
            }
        }
    }

    // endregion

    // region Watchers

    @Watch('items', { immediate: true, deep: true })
    public onItemsChanged(items: ItemLolApi[]) {
        if (QuizStageStore.isLoading && items) {
            this.startNewQuiz();
        }
    }

    @Watch('quizStageStore.stage', { deep: true })
    public onQuizStateChanged() {
        if (QuizStageStore.isAnswering) {
            this.$refs.quiz.focusAnswerInput();
        } else if (QuizStageStore.isQuizFinished) {
            if (this.quizConfiguration.withStopWatch && this.$refs.stopWatch) {
                this.participant.completeTime = { ...this.$refs.stopWatch.getTime };
            }
        }
    }

    // endregion
}
</script>
