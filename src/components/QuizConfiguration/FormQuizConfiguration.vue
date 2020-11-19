<template>
    <div>
        <div>
            <div class="text-bold">Quiz:</div>
            <q-btn-toggle
                v-model="internalQuizConfiguration.quiz.internalName"
                :options="quizList.map(q => ({ label: q.name, value: q.internalName }))"
                toggle-color="primary"
                @input="$emit('input', internalQuizConfiguration)"
            />
        </div>

        <div class="q-pt-md">
            <div class="text-bold">Number of questions:</div>
            <q-btn-toggle
                v-model="internalQuizConfiguration.numberQuestions"
                :options="[
                    {label: '∞', value: 0},
                    {label: '5', value: 5},
                    {label: '10', value: 10},
                    {label: '20', value: 20},
                    {label: '25', value: 25},
                    {label: '30', value: 30},
                  ]"
                toggle-color="primary"
                @input="$emit('input', internalQuizConfiguration)"
            />
        </div>

        <div class="q-pt-md">
            <div class="text-bold">With stopwatch:</div>
            <q-btn-toggle
                v-model="internalQuizConfiguration.withStopWatch"
                :options="[
                    {label: 'Yes', value: true},
                    {label: 'No', value: false},
                  ]"
                toggle-color="primary"
                @input="$emit('input', internalQuizConfiguration)"
            />
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import Quiz, { quizList } from 'src/models/Quiz';
import QuizConfiguration, { createDefaultQuizConfiguration } from 'src/models/QuizConfiguration';

@Component
export default class FormQuizConfiguration extends Vue {
    // region Data

    private internalQuizConfiguration: QuizConfiguration = createDefaultQuizConfiguration();

    private quizList: Quiz[] = quizList;

    // endregion

    // region Watchers

    @Watch('$attrs.value', { deep: true })
    public onValueChanged(value: QuizConfiguration): void {
        this.internalQuizConfiguration = value;
    }

    // endregion
}
</script>
