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

@Component({
    components: {
        ChampionQuizLayout,
    },
})
export default class ChampionSplashArtPage extends Mixins(QuizChampionMixin) {
    // region Data

    private pixelateValue: number = findChampionWithSplashArtScoreCalculation[0].pixelateValue;

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

        this.pixelateValue = scoreCalculation.pixelateValue;

        if (scoreCalculation.score < 1) {
            this.onPickNextChampion();
        }
    }

    private getScoreCalculation(totalSecondsElapsed: number): FindChampionWithSplashArtScoreCalculation {
        const scoreCalculation = findChampionWithSplashArtScoreCalculation.find(sc => totalSecondsElapsed < sc.secondMax);

        if (scoreCalculation) {
            return scoreCalculation;
        }
        return {
            pixelateValue: 1,
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
