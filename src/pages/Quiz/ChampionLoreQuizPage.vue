<template>
    <champion-lore-quiz-layout
        :champion-to-guess="elementToGuess"
        :quiz-answer="currentQuizAnswer"
        v-on:verify-answer="onVerifyAnswer(onCorrectAnswer)"
    ></champion-lore-quiz-layout>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import ChampionQuizLayout from 'components/QuizLayout/ChampionImageQuizLayout.vue';
import ImageChampion from 'components/Champion/ImageChampion.vue';
import QuizAnswerMixin from 'src/mixins/quizAnswerMixin';
import ChampionLoreQuizLayout from 'components/QuizLayout/ChampionLoreQuizLayout.vue';

@Component({
    components: {
        ChampionLoreQuizLayout,
        ImageChampion,
        ChampionQuizLayout,
    },
})
export default class ChampionLoreQuizPage extends Mixins(QuizAnswerMixin) {
    // region Event handlers

    private onCorrectAnswer() {
        if (this.lastPlayerAnswerHistory) {
            this.lastPlayerAnswerHistory.score = 1;
        }

        // Si la réponse est correcte, incrémente le score et passe au prochain objet.
        this.player = { ...this.player, score: this.player.score + 1 };
    }

    // endregion
}
</script>
