<template>
    <champion-image-quiz-layout
        :champion-to-guess="elementToGuess"
        :pixelated-value="pixelateValue"
        :skin-number="skinNumber"
        @skip="pixelateValue = 50"
        v-on:verify-answer="onVerifyAnswer(onCorrectAnswer)"
        v-on:image-champion-loaded="onImageChampionLoaded"
    ></champion-image-quiz-layout>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator';
import { FindChampionWithSplashArtScoreCalculation, findChampionWithSplashArtScoreCalculation } from 'src/models/Quiz';
import ImageChampion from 'components/Champion/ImageChampion.vue';
import { ImageTypesChampionLolApi, SkinTypes } from 'src/models/LolApi/ChampionLolApi';
import QuizConfigurationChampion from 'src/models/QuizConfigurationChampion';
import QuizAnswerMixin from 'src/mixins/quizAnswerMixin';
import ChampionImageQuizLayout from 'components/QuizLayout/ChampionImageQuizLayout.vue';

@Component({
    components: {
        ChampionImageQuizLayout,
        ImageChampion,
    },
})
export default class ChampionImageQuizPage extends Mixins(QuizAnswerMixin) {
    // region Data

    private pixelateValue: number = 999;

    // endregion

    // region Computed properties

    private get quizConfigurationChampion(): QuizConfigurationChampion {
        return this.quizConfiguration as QuizConfigurationChampion;
    }

    private get skinNumber(): number {
        if (this.quizConfigurationChampion.skinsIndex) {
            // eslint-disable-next-line
            return this.quizConfigurationChampion.skinsIndex[this.player.currentQuestionNumber - 1];
        }

        return 0;
    }

    // endregion

    // region Hooks

    public mounted() {
        const scoreCalculation = findChampionWithSplashArtScoreCalculation[0];

        this.pixelateValue = this.findPixelateValue(scoreCalculation);
    }

    // endregion

    // region Event handlers

    private onCorrectAnswer() {
        if (this.timeRemaining) {
            // Si la réponse est correcte, incrémente le score et passe au prochain champion.
            const totalSecondsRemaining = this.timeRemaining.totalSeconds;
            const scoreCalculation = this.getScoreCalculation(totalSecondsRemaining);

            if (this.lastPlayerAnswerHistory) {
                this.lastPlayerAnswerHistory.score = scoreCalculation.score;
                this.lastPlayerAnswerHistory.totalScore = findChampionWithSplashArtScoreCalculation[0].score;
            }

            const newScore = this.player.score + scoreCalculation.score;
            this.player = { ...this.player, score: newScore };
        }
    }

    private onImageChampionLoaded() {
        if (!this.lastPlayerAnswerHistory?.endDate) {
            this.setDatesToLastPlayerAnswer();
        }
    }

    // endregion

    // region Methods

    private updatePixelateValue(totalSecondsRemaining: number) {
        const scoreCalculation = this.getScoreCalculation(totalSecondsRemaining);

        this.pixelateValue = this.findPixelateValue(scoreCalculation);

        if (scoreCalculation.score < 0) {
            this.onPickNext();
        }
    }

    private findPixelateValue(scoreCalculation: FindChampionWithSplashArtScoreCalculation): number {
        switch (this.quizConfigurationChampion.imageType) {
            case ImageTypesChampionLolApi.splash:
                if (this.quizConfigurationChampion.skins === SkinTypes.onlyDefault) {
                    return scoreCalculation.pixelateValueSplashDefaultSkin;
                }

                if (this.quizConfigurationChampion.skins === SkinTypes.allWithoutDefault || this.quizConfigurationChampion.skins === SkinTypes.all) {
                    return scoreCalculation.pixelateValueSplashAllSkins;
                }

                break;
            case ImageTypesChampionLolApi.loading:
                if (this.quizConfigurationChampion.skins === SkinTypes.onlyDefault) {
                    return scoreCalculation.pixelateValueLoadingDefaultSkin;
                }

                if (this.quizConfigurationChampion.skins === SkinTypes.allWithoutDefault || this.quizConfigurationChampion.skins === SkinTypes.all) {
                    return scoreCalculation.pixelateValueLoadingAllSkins;
                }

                break;
            case ImageTypesChampionLolApi.portrait:
                return scoreCalculation.pixelateValuePortrait;

            default:
                return 999;
        }

        return 999;
    }

    private getScoreCalculation(totalSecondsRemaining: number): FindChampionWithSplashArtScoreCalculation {
        const scoreCalculation = findChampionWithSplashArtScoreCalculation.find(sc => totalSecondsRemaining > sc.secondMin);

        if (scoreCalculation) {
            return scoreCalculation;
        }

        return {
            pixelateValuePortrait: 1,
            pixelateValueSplashDefaultSkin: 1,
            pixelateValueLoadingDefaultSkin: 1,
            pixelateValueLoadingAllSkins: 1,
            pixelateValueSplashAllSkins: 1,
            secondMin: -1,
            score: -1,
        };
    }

    // endregion

    // region Watchers

    @Watch('timeRemaining.totalSeconds')
    private onTimeRemainingChanged(value: number) {
        this.updatePixelateValue(value);
    }

    // endregion
}
</script>
