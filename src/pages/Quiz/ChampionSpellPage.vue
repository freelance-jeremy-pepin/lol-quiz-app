<template>
    <champion-spell-quiz-layout
        :champion-spell-to-guess="elementToGuess"
        v-on:verify-answer="onVerifyAnswer(onCorrectAnswer)"
    ></champion-spell-quiz-layout>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import ResultQuiz from 'components/Quiz/ResultQuiz.vue';
import IconAndInputQuizLayout from 'components/QuizLayout/IconAndInputQuizLayout.vue';
import QuizAnswerMixin from 'src/mixins/quizAnswerMixin';
import ChampionSpellQuizLayout from 'components/QuizLayout/ChampionSpellQuizLayout.vue';

@Component({
    components: {
        ChampionSpellQuizLayout,
        IconAndInputQuizLayout,
        ResultQuiz,
    },
})
export default class ChampionSpellPage extends Mixins(QuizAnswerMixin) {
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
