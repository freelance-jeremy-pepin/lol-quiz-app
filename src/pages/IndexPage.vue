<template>
    <q-page class="q-pa-md row items-center justify-center" style="margin-top: 16px;">
        <q-card align="center" style="max-width: 500px; width: 100%;">
            <q-card-section class="bg-primary text-white">
                <div class="text-h3">Select your quiz</div>
            </q-card-section>

            <q-card-section>
                <form-quiz-configuration v-model="internalQuizConfiguration"></form-quiz-configuration>
            </q-card-section>

            <q-card-section>
                <q-btn label="Rooms" to="/rooms"></q-btn>
            </q-card-section>

            <q-card-actions class="q-pa-none">
                <q-btn
                    class="full-width"
                    style="border-top-left-radius: 0; border-top-right-radius: 0;"
                    color="accent"
                    size="lg"
                    @click="onStartQuiz"
                >Start
                </q-btn>
            </q-card-actions>
        </q-card>
    </q-page>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import QuizConfiguration, { createDefaultQuizConfiguration } from 'src/models/QuizConfiguration';
import FormQuizConfiguration from 'components/QuizConfiguration/FormQuizConfiguration.vue';

@Component({
    components: { FormQuizConfiguration },
})
export default class PageIndex extends Vue {
    // region Data

    private internalQuizConfiguration: QuizConfiguration = createDefaultQuizConfiguration();

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

    // endregion
}
</script>
