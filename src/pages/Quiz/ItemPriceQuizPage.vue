<template>
    <item-quiz-layout
        :item-to-guess="elementToGuess"
        v-on:verify-answer="onVerifyAnswer(null, onAnswered)"
    ></item-quiz-layout>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import ResultQuiz from 'components/Quiz/ResultQuiz.vue';
import IconItem from 'components/Item/IconItem.vue';
import IconAndInputQuizLayout from 'components/QuizLayout/IconAndInputQuizLayout.vue';
import ItemQuizLayout from 'components/QuizLayout/ItemQuizLayout.vue';
import { stringToInt } from 'src/utils/number';
import QuizAnswerMixin from 'src/mixins/quizAnswerMixin';

@Component({
    components: {
        ItemQuizLayout,
        IconAndInputQuizLayout,
        IconItem,
        ResultQuiz,
    },
})
export default class ItemPriceQuizPage extends Mixins(QuizAnswerMixin) {
    // region Event handlers

    private onAnswered() {
        const priceItem: number = stringToInt(this.currentQuizAnswer.value);
        const priceGivenByPlayer: number = stringToInt(this.answerGivenByPlayer);

        const score = Math.abs(priceItem - priceGivenByPlayer);

        if (this.lastPlayerAnswerHistory) {
            this.lastPlayerAnswerHistory.score = score;
        }

        this.player = { ...this.player, score: this.player.score + score };

        this.onPickNext();
    }

    // endregion
}
</script>
