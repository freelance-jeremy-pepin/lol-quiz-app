<template>
    <q-page class="q-pa-md row items-center justify-center" style="margin-top: 16px;">
        <card-with-title-and-action
            :max-width="500"
            action-label="Start"
            title="Select your quiz"
            @action="onStartQuiz"
        >
            <q-card-section>
                <form-quiz-configuration v-model="internalQuizConfiguration"></form-quiz-configuration>
            </q-card-section>

            <q-card-section>
                <q-btn label="Rooms" to="/rooms"></q-btn>
            </q-card-section>
        </card-with-title-and-action>
    </q-page>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import QuizConfiguration, { createDefaultQuizConfiguration } from 'src/models/QuizConfiguration';
import FormQuizConfiguration from 'components/QuizConfiguration/FormQuizConfiguration.vue';
import CardWithTitleAndAction from 'components/Common/CardWithTitleAndAction.vue';

@Component({
    components: { CardWithTitleAndAction, FormQuizConfiguration },
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
