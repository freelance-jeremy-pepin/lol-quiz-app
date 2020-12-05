<template>
    <champion-quiz-layout
        :champion-to-guess="elementToGuess"
        :pixelated-value="pixelateValue"
        :skin-number="skinNumber"
        @skip="pixelateValue = 50"
        v-on:verify-answer="onVerifyAnswer(onCorrectAnswer)"
    ></champion-quiz-layout>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator';
import ChampionQuizLayout from 'components/QuizLayout/ChampionQuizLayout.vue';
import { FindChampionWithSplashArtScoreCalculation, findChampionWithSplashArtScoreCalculation } from 'src/models/Quiz';
import ImageChampion from 'components/Champion/ImageChampion.vue';
import { ImageTypesChampionLolApi, SkinTypes } from 'src/models/LolApi/ChampionLolApi';
import QuizConfigurationChampion from 'src/models/QuizConfigurationChampion';
import QuizAnswerMixin from 'src/mixins/quizAnswerMixin';

@Component({
    components: {
        ImageChampion,
        ChampionQuizLayout,
    },
})
export default class ChampionImagePage extends Mixins(QuizAnswerMixin) {
    // region Data

    private pixelateValue: number = 999;

    // endregion

    // region Computed properties

    private get skinNumber(): number {
        if (this.quizConfiguration.skinsIndex) {
            // eslint-disable-next-line
            return this.quizConfiguration.skinsIndex[this.player.currentQuestionNumber - 1];
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

    // endregion

    // region Methods

    private updatePixelateValue(totalSecondsRemaining: number) {
        const scoreCalculation = this.getScoreCalculation(totalSecondsRemaining);

        this.pixelateValue = this.findPixelateValue(scoreCalculation);

        if (scoreCalculation.score < 0) {
            this.onPickNext();
        }
    }

    // eslint-disable-next-line consistent-return
    private findPixelateValue(scoreCalculation: FindChampionWithSplashArtScoreCalculation): number {
        const quizConfiguration: QuizConfigurationChampion = this.quizConfiguration as QuizConfigurationChampion;

        switch (quizConfiguration.imageType) {
            case ImageTypesChampionLolApi.splash:
                if (this.quizConfiguration.skins === SkinTypes.default) {
                    return scoreCalculation.pixelateValueSplashDefaultSkin;
                }

                if (this.quizConfiguration.skins === SkinTypes.allWithoutDefault || this.quizConfiguration.skins === SkinTypes.all) {
                    return scoreCalculation.pixelateValueSplashAllSkins;
                }

                break;
            case ImageTypesChampionLolApi.loading:
                if (this.quizConfiguration.skins === SkinTypes.default) {
                    return scoreCalculation.pixelateValueLoadingDefaultSkin;
                }

                if (this.quizConfiguration.skins === SkinTypes.allWithoutDefault || this.quizConfiguration.skins === SkinTypes.all) {
                    return scoreCalculation.pixelateValueLoadingAllSkins;
                }

                break;
            default:
                return 999;
        }
    }

    private getScoreCalculation(totalSecondsRemaining: number): FindChampionWithSplashArtScoreCalculation {
        const scoreCalculation = findChampionWithSplashArtScoreCalculation.find(sc => totalSecondsRemaining > sc.secondMin);

        if (scoreCalculation) {
            return scoreCalculation;
        }

        return {
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
