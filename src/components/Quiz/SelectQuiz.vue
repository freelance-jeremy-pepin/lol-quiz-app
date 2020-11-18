<template>
    <q-card class="text-center" style="max-width: 400px; width: 100%;">
        <q-card-section class="bg-primary text-white">
            <div class="text-h3">Select your quiz</div>
        </q-card-section>

        <q-card-section>
            <div class="text-bold">Quiz:</div>
            <q-btn-toggle
                v-model="selectedQuiz"
                :options="[
                    {label: 'Name quiz', value: 'name'},
                  ]"
                toggle-color="primary"
                @input="saveInLocalStorage"
            />
        </q-card-section>

        <q-card-section>
            <div class="text-bold">Number of questions:</div>
            <q-btn-toggle
                v-model="numberQuestions"
                :options="[
                    {label: '∞', value: '0'},
                    {label: '5', value: '5'},
                    {label: '10', value: '10'},
                    {label: '20', value: '20'},
                    {label: '25', value: '25'},
                    {label: '30', value: '30'},
                  ]"
                toggle-color="primary"
                @input="saveInLocalStorage"
            />
        </q-card-section>

        <q-card-section>
            <div class="text-bold">With stopwatch:</div>
            <q-btn-toggle
                v-model="withStopWatch"
                :options="[
                    {label: 'Yes', value: '1'},
                    {label: 'No', value: '0'},
                  ]"
                toggle-color="primary"
                @input="saveInLocalStorage"
            />
        </q-card-section>

        <q-card-section>
            <q-btn class="full-width" color="primary" @click="onStartQuiz">Start</q-btn>
        </q-card-section>
    </q-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Socket } from 'vue-socket.io-extended';

@Component
export default class SelectQuiz extends Vue {
    // region Data

    private selectedQuiz: string = 'name';

    private numberQuestions: string = '0';

    private withStopWatch: string = '1';

    // endregion

    // region Hooks

    private mounted() {
        this.restoreFormLocalStorage();
    }

    // endregion

    // region Events handlers

    private onStartQuiz() {
        this.redirectToQuiz();
    }

    // endregion

    // region Methods

    private redirectToQuiz() {
        this.$router.push({
            path: `/quiz/${this.selectedQuiz}`,
            query: {
                numberQuestions: this.numberQuestions,
                withStopWatch: this.withStopWatch,
            },
        });
    }

    private restoreFormLocalStorage() {
        this.selectedQuiz = this.$q.localStorage.getItem('selectedQuiz') || 'name';
        this.numberQuestions = this.$q.localStorage.getItem('numberQuestions') || '0';
        this.withStopWatch = this.$q.localStorage.getItem('withStopWatch') || '1';
    }

    private saveInLocalStorage() {
        this.$q.localStorage.set('selectedQuiz', this.selectedQuiz);
        this.$q.localStorage.set('numberQuestions', this.numberQuestions);
        this.$q.localStorage.set('withStopWatch', this.withStopWatch);
    }

    // endregion
}
</script>
