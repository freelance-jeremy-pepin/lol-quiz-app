<template>
    <div>
        <div>
            <div class="text-bold">Quiz</div>
            <q-btn-toggle
                v-model="internalQuizConfiguration.quiz.internalName"
                :options="quizList.map(q => ({ label: q.name, value: q.internalName }))"
                toggle-color="primary"
                @input="onInput"
            />
        </div>

        <div class="q-pt-md">
            <div class="text-bold">Number of questions</div>
            <q-btn-toggle
                v-model="internalQuizConfiguration.numberQuestions"
                :options="numberQuestionsOptions"
                toggle-color="primary"
                @input="onInput"
            />
        </div>

        <div class="q-pt-md">
            <div class="text-bold">With stopwatch</div>
            <q-btn-toggle
                v-model="internalQuizConfiguration.withStopWatch"
                :options="[
                    {label: 'Yes', value: true},
                    {label: 'No', value: false},
                  ]"
                toggle-color="primary"
                @input="onInput"
            />
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import Quiz, { quizList } from 'src/models/Quiz';
import QuizConfiguration, { createDefaultQuizConfiguration } from 'src/models/QuizConfiguration';

@Component
export default class FormQuizConfiguration extends Vue {
    // region Props

    @Prop({ required: false, default: true, type: Boolean }) withTraining!: boolean;

    // endregion

    // region Computed properties

    private get numberQuestionsOptions(): any[] {
        let options = [];

        if (this.withTraining) {
            options.push({ label: '∞', value: 0 });
        }

        options = options.concat([
            { label: '5', value: 5 },
            { label: '10', value: 10 },
            { label: '20', value: 20 },
            { label: '25', value: 25 },
            { label: '30', value: 30 },
        ]);

        return options;
    }

    // endregion

    // region Data

    private internalQuizConfiguration: QuizConfiguration = createDefaultQuizConfiguration();

    private quizList: Quiz[] = quizList;

    // endregion

    // region Hooks

    private mounted() {
        this.restoreFormLocalStorage();
    }

    // endregion

    // region Events handlers

    private onInput() {
        this.saveInLocalStorage();
        this.$emit('input', this.internalQuizConfiguration);
    }

    // endregion

    // region Methods

    private restoreFormLocalStorage() {
        const quizConfigurationInLocalStorage = this.$q.localStorage.getItem('quiz-configuration') as QuizConfiguration;

        if (quizConfigurationInLocalStorage) {
            this.$emit('input', quizConfigurationInLocalStorage);
            this.internalQuizConfiguration = quizConfigurationInLocalStorage;
        }
    }

    private saveInLocalStorage() {
        const quizFound = quizList.find(q => q.internalName === this.internalQuizConfiguration.quiz.internalName);

        if (quizFound) {
            this.internalQuizConfiguration.quiz = quizFound;
        }

        this.$q.localStorage.set('quiz-configuration', this.internalQuizConfiguration);
    }

    // endregion

    // region Watchers

    @Watch('$attrs.value', { deep: true })
    public onValueChanged(value: QuizConfiguration): void {
        this.internalQuizConfiguration = value;
    }

    // endregion
}
</script>