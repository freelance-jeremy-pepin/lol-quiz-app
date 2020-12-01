<template>
    <champion-quiz-layout
        :pixelated-value="pixelateValue"
        @skip="pixelateValue = 50"
        v-on:correct-answer="onCorrectAnswer"
    ></champion-quiz-layout>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator';
import ChampionQuizLayout from 'components/QuizLayout/ChampionQuizLayout.vue';
import { FindChampionWithSplashArtScoreCalculation, findChampionWithSplashArtScoreCalculation } from 'src/models/Quiz';
import QuizChampionMixin from 'src/mixins/quizChampionMixin';
import ImageChampion from 'components/Champion/ImageChampion.vue';
import { ImageTypesChampionLolApi } from 'src/models/LolApi/ChampionLolApi';
import QuizConfigurationChampion from 'src/models/QuizConfigurationChampion';

@Component({
    components: {
        ImageChampion,
        ChampionQuizLayout,
    },
})
export default class ChampionImagePage extends Mixins(QuizChampionMixin) {
    // region Data

    private pixelateValue: number = 999;

    // endregion

    // region Hooks

    public mounted() {
        const quizConfiguration: QuizConfigurationChampion = this.quizConfiguration as QuizConfigurationChampion;
        switch (quizConfiguration.imageType) {
            case ImageTypesChampionLolApi.splash:
                this.pixelateValue = findChampionWithSplashArtScoreCalculation[0].pixelateValueSplash;
                break;
            case ImageTypesChampionLolApi.loading:
                this.pixelateValue = findChampionWithSplashArtScoreCalculation[0].pixelateValueLoading;
                break;
            default:
                this.pixelateValue = 999;
        }
    }

    // endregion

    // region Event handlers

    private onCorrectAnswer() {
        // Si la réponse est correcte, incrémente le score et passe au prochain champion.
        const totalSecondsElapsed = this.timeElapsed.totalSeconds;
        const scoreCalculation = this.getScoreCalculation(totalSecondsElapsed);

        if (this.lastPlayerAnswerHistory) {
            this.lastPlayerAnswerHistory.score = scoreCalculation.score;
            this.lastPlayerAnswerHistory.totalScore = findChampionWithSplashArtScoreCalculation[0].score;
        }

        const newScore = this.player.score + scoreCalculation.score;
        this.player = { ...this.player, score: newScore };

        this.onPickNextChampion();
    }

    // endregion

    // region Methods

    private updatePixelateValue(totalSecondsElapsed: number) {
        const scoreCalculation = this.getScoreCalculation(totalSecondsElapsed);
        const quizConfiguration: QuizConfigurationChampion = this.quizConfiguration as QuizConfigurationChampion;

        switch (quizConfiguration.imageType) {
            case ImageTypesChampionLolApi.splash:
                this.pixelateValue = scoreCalculation.pixelateValueSplash;
                break;
            case ImageTypesChampionLolApi.loading:
                this.pixelateValue = scoreCalculation.pixelateValueLoading;
                break;
            default:
                this.pixelateValue = 1;
        }

        if (scoreCalculation.secondMax < 0) {
            this.onPickNextChampion();
        }
    }

    private getScoreCalculation(totalSecondsElapsed: number): FindChampionWithSplashArtScoreCalculation {
        const scoreCalculation = findChampionWithSplashArtScoreCalculation.find(sc => totalSecondsElapsed < sc.secondMax);

        if (scoreCalculation) {
            return scoreCalculation;
        }
        return {
            pixelateValueSplash: 1,
            pixelateValueLoading: 1,
            secondMax: -1,
            score: 0,
        };
    }

    // endregion

    // region Watchers

    @Watch('timeElapsed.totalSeconds')
    private onTimeElapsedChanged(value: number) {
        this.updatePixelateValue(value);
    }

    // endregion
}
</script>
