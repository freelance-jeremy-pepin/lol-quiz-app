<template>
    <item-quiz-layout
        v-on:skip="onSkipItem"
        v-on:focus-answer-input="focusAnswerInput"
        v-on:verify-answer="onVerifyAnswer(onCorrectAnswer)"
        v-on:play-again="onPlayAgain"
    ></item-quiz-layout>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import ResultQuiz from 'components/Quiz/ResultQuiz.vue';
import IconItem from 'components/Item/IconItem.vue';
import IconAndInputQuizLayout from 'components/QuizLayout/IconAndInputQuizLayout.vue';
import QuizItemMixin from 'src/mixins/quizItemMixin';
import ItemQuizLayout from 'components/QuizLayout/ItemQuizLayout.vue';

@Component({
    components: {
        ItemQuizLayout,
        IconAndInputQuizLayout,
        IconItem,
        ResultQuiz,
    },
})
export default class ItemNameQuizPage extends Mixins(QuizItemMixin) {
    // region Event handlers

    private onCorrectAnswer() {
        if (this.lastPlayerAnswerHistory) {
            this.lastPlayerAnswerHistory.score = 1;
        }

        // Si la réponse est correcte, incrémente le score et passe au prochain objet.
        this.player = { ...this.player, score: this.player.score + 1 };

        this.onPickNextItem();
    }

    // endregion
}
</script>
