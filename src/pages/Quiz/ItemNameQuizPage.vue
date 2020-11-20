<template>
    <q-page class="q-pa-md row items-center justify-evenly" style="margin-top: 16px;">
        <div class="column items-center" style="max-width: 300px; width: 100%;">
            <icon-and-input-quiz-layout
                v-show="!quizStageStore.isLoading"
                ref="quiz"
                v-model="answer"
                :participant="participant"
                :quiz-configuration="quizConfigurationItem"
                v-on:skip="onSkipItem"
                v-on:verify-answer="onVerifyAnswer"
                v-on:toggle-history="historyIsVisible =! historyIsVisible"
                v-on:play-again="onStartNewQuiz"
                v-on:view-history="historyIsVisible = true"
            >
                <template v-slot:image>
                    <icon-item
                        v-if="currentItem"
                        :item="currentItem"
                        :with-tooltip="!quizStageStore.isAnswering"
                    ></icon-item>
                </template>
            </icon-and-input-quiz-layout>

            <list-answers-history-item
                v-model="historyIsVisible"
                :answers-history-item="participant.answersHistoryItem"
            ></list-answers-history-item>
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
import IconAndInputQuizLayout from 'components/QuizLayout/IconAndInputQuizLayout.vue';
import Participant, { createDefaultParticipant } from 'src/models/Participant';
import UserStore from 'src/store/modules/UserStore';
import ListAnswersHistoryItem from 'components/AnswerHistoryItem/ListAnswersHistoryItem.vue';
import QuizConfigurationItem, { createDefaultQuizConfigurationItem } from 'src/models/QuizConfigurationItem';

@Component({
    components: {
        ListAnswersHistoryItem,
        IconAndInputQuizLayout,
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

    private quizConfigurationItem: QuizConfigurationItem = createDefaultQuizConfigurationItem();

    private currentItem: ItemLolApi | null = null;

    private itemsToFind: ItemLolApi[] | null = null;

    private answer: string = '';

    private historyIsVisible: boolean = false;

    public $refs!: {
        quiz: HTMLFormElement;
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
    }

    // noinspection JSUnusedLocalSymbols
    private mounted() {
        this.initQuizConfigurationItem();
        this.initParticipant();
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

        if (this.$refs.quiz) {
            this.$refs.quiz.focusAnswerInput();
        }
    }

    private onSkipItem() {
        this.skipItem();
    }

    private onStartNewQuiz() {
        this.startNewQuiz();
    }

    // endregion

    // region Methods

    private startNewQuiz() {
        this.resetQuiz();

        this.onPickItem();

        QuizStageStore.setAnswering();
    }

    private initQuizConfigurationItem() {
        this.quizConfigurationItem = createDefaultQuizConfigurationItem();

        this.quizConfigurationItem = {
            ...this.quizConfigurationItem,
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
        if (this.participant.currentQuestionNumber >= this.quizConfigurationItem.numberQuestions) {
            QuizStageStore.setQuizFinished();
            return;
        }

        this.participant.currentQuestionNumber += 1;
        this.pickNextItem();

        this.addEmptyAnswerToHistory();

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

    private addEmptyAnswerToHistory() {
        const lastAnswer = this.participant.answersHistoryItem[this.participant.answersHistoryItem.length - 1];

        if (lastAnswer) {
            lastAnswer.isAnswering = false;
        }

        if (this.currentItem) {
            this.participant.answersHistoryItem.push({
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
        const lastAnswer = this.participant.answersHistoryItem[this.participant.answersHistoryItem.length - 1];
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
        this.participant.answersHistoryItem = [];
        this.itemsToFind = [];

        if (this.items) {
            const itemsToPick: ItemLolApi[] = [...this.items];
            for (let i = 0; i < this.quizConfigurationItem.numberQuestions; i++) {
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
            if (this.quizConfigurationItem.withStopWatch && this.$refs.quiz) {
                this.participant.completeTime = { ...this.$refs.quiz.getTime() };
            }
        }
    }

    // endregion
}
</script>
