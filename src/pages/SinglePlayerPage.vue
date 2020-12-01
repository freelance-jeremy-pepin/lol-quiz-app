<template>
    <q-page class="q-pa-md row items-center justify-center" style="margin-top: 16px;">
        <card-with-title-and-action
            action-label="Start"
            style="max-width: 500px;"
            title="Select your quiz"
            @action="onStartQuiz"
        >
            <q-card-section>
                <form-quiz-configuration v-model="internalQuizConfiguration"></form-quiz-configuration>
            </q-card-section>
        </card-with-title-and-action>
    </q-page>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import QuizConfiguration, { createDefaultQuizConfiguration } from 'src/models/QuizConfiguration';
import FormQuizConfiguration from 'components/QuizConfiguration/FormQuizConfiguration.vue';
import CardWithTitleAndAction from 'components/Common/CardWithTitleAndAction.vue';
import { QuizListInternalName } from 'src/models/Quiz';
import QuizConfigurationChampion from 'src/models/QuizConfigurationChampion';

@Component({
    components: { CardWithTitleAndAction, FormQuizConfiguration },
})
export default class SinglePlayerPage extends Vue {
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
        // eslint-disable-next-line
        const query: any = {
            quiz: this.internalQuizConfiguration.quiz.id.toString(),
            numberQuestions: this.internalQuizConfiguration.numberQuestions.toString(),
            withStopWatch: this.internalQuizConfiguration.withStopWatch.toString(),
        };

        if (this.internalQuizConfiguration.quiz.internalName === QuizListInternalName.ChampionImage) {
            const quizConfiguration: QuizConfigurationChampion = this.internalQuizConfiguration as QuizConfigurationChampion;
            query.imageType = quizConfiguration.imageType;
        }

        this.$router.push({
            path: `/quiz/${this.internalQuizConfiguration.quiz.internalName}`,
            query,
        });
    }

    // endregion
}
</script>
