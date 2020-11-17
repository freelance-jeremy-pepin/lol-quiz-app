<template>
    <div class="column items-center" style="max-width: 300px; width: 100%;">
        <result-quiz
            v-if="isQuizFinishedState"
            :number-questions="numberQuestions"
            :score="score"
            :time="time"
            @play-again="onStartNewQuiz"
        ></result-quiz>

        <q-card
            v-else
            style="width: 100%;"
            @keydown.shift="onPickItem"
        >
            <q-card-section v-if="isLoadingState" class="column items-center">
                <q-spinner color="primary" size="3em"></q-spinner>
            </q-card-section>

            <q-card-section v-else class="column items-center q-pa-md q-gutter-y-md">
                <icon-item :item="item" :with-tooltip="!isAnsweringState"></icon-item>

                <span
                    v-if="isDisplayAnswer"
                    class="text-bold"
                >
                    {{ item.name }}
                </span>

                <div v-if="!quizIsInfinite">{{ currentQuestion }}/{{ numberQuestions }}</div>
                <div>Score: {{ score }}</div>

                <q-input
                    v-if="!isDisplayAnswer"
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
                    v-if="!isDisplayAnswer"
                    :color="isWrongState ? 'negative' : 'primary'"
                    :disable="isVerifyingAnswerState"
                    class="full-width"
                    @click="onVerifyAnswer"
                >
                    {{
                        isWrongState ? 'Wrong' : isVerifyingAnswerState ? 'Verifying...' : 'Verify'
                    }}
                </q-btn>

                <q-btn v-else class="full-width" color="secondary" @click="onPickItem">
                    New item
                </q-btn>

                <q-btn
                    v-if="!numberQuestions && (isAnsweringState || isWrongState)"
                    class="full-width"
                    color="primary"
                    outline
                    @click="onGiveAnswer"
                >
                    Ask answer
                </q-btn>

                <q-btn
                    v-if="numberQuestions && (isAnsweringState || isWrongState)"
                    class="full-width"
                    color="negative"
                    outline
                    @click="skipItem"
                >
                    Skip
                </q-btn>
            </q-card-section>
        </q-card>

        <q-page-sticky
            v-if="withStopWatch && !isQuizFinishedState && !isLoadingState"
            :offset="[18, 18]"
            position="top-right"
        >
            <stop-watch ref="stopWatch"></stop-watch>
        </q-page-sticky>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Item } from 'src/models/item';
import IconItem from 'components/Item/IconItem.vue';
import StopWatch from 'components/Common/StopWatch.vue';
import { copyToClipboard } from 'quasar';
import ResultQuiz from 'components/Quiz/ResultQuiz.vue';
import { Time } from 'src/const';

enum State {
    loading = 'loading',
    answering = 'answering',
    right = 'right',
    wrong = 'wrong',
    verifyingAnswer = 'verifyingAnswer',
    answerGiven = 'answerGiven',
    quizFinished = 'quizFinished'
}

@Component({
    components: { ResultQuiz, StopWatch, IconItem },
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

    private state: State = State.loading;

    private score: number = 0;

    private currentQuestion: number = 0;

    private time: Time | null = null;

    public $refs!: {
        answerInput: any;
        stopWatch: any;
    };

    // endregion

    // region Computed properties

    public get quizIsInfinite(): boolean {
        return this.numberQuestions === 0;
    }

    public get isDisplayAnswer(): boolean {
        return this.isAnswerGivenState || this.isRightState;
    }

    private get isLoadingState(): boolean {
        return this.state === State.loading;
    }

    private get isAnsweringState(): boolean {
        return this.state === State.answering;
    }

    private get isRightState(): boolean {
        return this.state === State.right;
    }

    private get isWrongState(): boolean {
        return this.state === State.wrong;
    }

    private get isVerifyingAnswerState(): boolean {
        return this.state === State.verifyingAnswer;
    }

    private get isAnswerGivenState(): boolean {
        return this.state === State.answerGiven;
    }

    private get isQuizFinishedState(): boolean {
        return this.state === State.quizFinished;
    }

    // endregion

    // region Hooks

    private mounted() {
        window.addEventListener('keydown', this.onEnter);

        this.startNewQuiz();
    }

    private unmounted() {
        window.removeEventListener('keydown', this.onEnter);
    }

    // endregion

    // region Event handlers

    private onVerifyAnswer() {
        this.setVerifyingAnswerState();

        if (this.verifyAnswer()) {
            if (!this.quizIsInfinite) {
                this.onPickItem();
            } else {
                this.setRightState();
            }

            this.score += 1;
        } else {
            this.setWrongState();

            setTimeout(() => {
                if (this.state === State.wrong) {
                    this.setAnsweringState();
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
    }

    private onSkipItem() {
        this.skipItem();
    }

    private onEnter(e: KeyboardEvent) {
        if (e.key === 'Enter' && (this.isAnswerGivenState || this.isRightState)) {
            this.onPickItem();
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

            return itemName === answer;
        }

        return false;
    }

    private giveAnswer() {
        this.state = State.answerGiven;
    }

    private pickItem() {
        if (!this.quizIsInfinite && this.currentQuestion >= this.numberQuestions) {
            this.setQuizFinishedGivenState();
            return;
        }

        if (!this.quizIsInfinite) {
            this.currentQuestion += 1;
            this.pickNextItem();
        } else {
            this.pickRandomItem();
        }

        this.setAnsweringState();

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
        this.item = this.items[Math.floor(Math.random() * this.items.length)];
    }

    private skipItem() {
        this.onPickItem();
    }

    private startNewQuiz() {
        this.resetQuiz();

        this.pickItem();

        this.setAnsweringState();
    }

    private resetQuiz() {
        this.currentQuestion = 0;
        this.score = 0;
        this.itemsToFind = [];
        const itemsToPick = [...this.items];

        if (!this.quizIsInfinite) {
            for (let i = 0; i < this.numberQuestions; i++) {
                const itemPicked = itemsToPick[Math.floor(Math.random() * itemsToPick.length)];
                this.itemsToFind.push(itemPicked);
            }
        }
    }

    private setLoadingState() {
        this.state = State.loading;
    }

    private setAnsweringState() {
        this.state = State.answering;

        if (this.$refs.answerInput) {
            setTimeout(() => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                this.$refs.answerInput.focus();
            }, 20);
        }
    }

    private setRightState() {
        this.state = State.right;
    }

    private setWrongState() {
        this.state = State.wrong;
    }

    private setVerifyingAnswerState() {
        this.state = State.verifyingAnswer;
    }

    private setAnswerGivenState() {
        this.state = State.answerGiven;
    }

    private setQuizFinishedGivenState() {
        this.state = State.quizFinished;

        if (this.withStopWatch && this.$refs.stopWatch) {
            this.time = { ...this.$refs.stopWatch.getTime };
        }
    }

    // endregion
}
</script>
