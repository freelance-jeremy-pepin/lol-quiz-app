<template>
    <q-card
        style="width: 100%;"
    >
        <q-card-section v-if="quizStageStore.isLoading" class="column items-center">
            <q-spinner color="primary" size="3em"></q-spinner>
        </q-card-section>

        <q-card-section v-else class="column items-center q-pa-md q-gutter-y-md">
            <slot name="image"></slot>

            <div>{{ participant.currentQuestionNumber }}/{{ quizConfiguration.numberQuestions }}</div>

            <div>Score: {{ participant.score }}</div>

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
                outline
                @click="$emit('skip')"
            >
                Skip
            </q-btn>
        </q-card-section>
    </q-card>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import QuizStageStore from 'src/store/modules/QuizStageStore';
import QuizConfiguration from 'src/models/QuizConfiguration';
import Participant from 'src/models/Participant';

@Component
export default class IconAndInputQuizLayout extends Vue {
    // region Props

    @Prop({ required: true }) participant!: Participant;

    @Prop({ required: true }) quizConfiguration!: QuizConfiguration;

    // endregion

    // region Data

    private answer: string = '';

    public $refs!: {
        answerInput: HTMLFormElement;
    };

    // endregion

    // region Computed properties

    public get quizStageStore(): typeof QuizStageStore {
        return QuizStageStore;
    }

    // endregion

    // region Methods

    public focusAnswerInput() {
        setTimeout(() => {
            if (this.$refs.answerInput) {
                this.$refs.answerInput.focus();
            }
        }, 20);
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
