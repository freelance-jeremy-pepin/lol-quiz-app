<template>
    <q-card class="text-center" style="max-width: 400px; width: 100%;">
        <q-card-section class="bg-primary text-white">
            <div class="text-h3">Select your quiz</div>
        </q-card-section>

        <form-quiz-configuration v-model="internalQuizConfiguration" @input="saveInLocalStorage"></form-quiz-configuration>

        <q-card-section>
            <q-btn class="full-width" color="primary" @click="onStartQuiz">Start</q-btn>
        </q-card-section>
    </q-card>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import Quiz, { quizList } from 'src/models/Quiz';
import QuizConfiguration, { createDefaultQuizConfiguration } from 'src/models/QuizConfiguration';
import FormQuizConfiguration from 'components/QuizConfiguration/FormQuizConfiguration.vue';

@Component({
    components: { FormQuizConfiguration },
})
export default class SelectQuiz extends Vue {
    // region Data

    private internalQuizConfiguration: QuizConfiguration = createDefaultQuizConfiguration();

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
            path: `/quiz/${this.internalQuizConfiguration.quiz.internalName}`,
            query: {
                numberQuestions: this.internalQuizConfiguration.numberQuestions.toString(),
                withStopWatch: this.internalQuizConfiguration.withStopWatch.toString(),
            },
        });
    }

    private restoreFormLocalStorage() {
        this.internalQuizConfiguration = this.$q.localStorage.getItem('quiz-configuration') || createDefaultQuizConfiguration();
    }

    private saveInLocalStorage() {
        const quizFound = quizList.find(q => q.internalName === this.internalQuizConfiguration.quiz.internalName);

        if (quizFound) {
            this.internalQuizConfiguration.quiz = quizFound;
        }

        this.$q.localStorage.set('quiz-configuration', this.internalQuizConfiguration);
    }

    // endregion
}
</script>
