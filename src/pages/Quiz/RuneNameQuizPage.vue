<template>
    <rune-quiz-layout
        v-on:skip="onSkipRune"
        v-on:focus-answer-input="focusAnswerInput"
        v-on:verify-answer="onVerifyAnswer(onCorrectAnswer)"
        v-on:play-again="onPlayAgain"
    ></rune-quiz-layout>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import ResultQuiz from 'components/Quiz/ResultQuiz.vue';
import IconAndInputQuizLayout from 'components/QuizLayout/IconAndInputQuizLayout.vue';
import QuizRuneMixin from 'src/mixins/quizRuneMixin';
import RuneQuizLayout from 'components/QuizLayout/RuneQuizLayout.vue';

@Component({
    components: {
        RuneQuizLayout,
        IconAndInputQuizLayout,
        ResultQuiz,
    },
})
export default class ItemNameQuizPage extends Mixins(QuizRuneMixin) {
    // region Event handlers

    private onCorrectAnswer() {
        if (this.lastPlayerAnswerHistory) {
            this.lastPlayerAnswerHistory.score = 1;
        }

        // Si la réponse est correcte, incrémente le score et passe au prochain objet.
        this.player = { ...this.player, score: this.player.score + 1 };

        this.onPickNextRune();
    }

    // endregion
}
</script>
