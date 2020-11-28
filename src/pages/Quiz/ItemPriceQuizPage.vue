<template>
    <item-quiz-layout v-on:answered="onAnswered"></item-quiz-layout>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import ResultQuiz from 'components/Quiz/ResultQuiz.vue';
import IconItem from 'components/Item/IconItem.vue';
import IconAndInputQuizLayout from 'components/QuizLayout/IconAndInputQuizLayout.vue';
import ListAnswersHistoryItem from 'components/AnswerHistory/ListAnswersHistory.vue';
import TableAnswerHistoryItem from 'components/AnswerHistory/TableAnswerHistory.vue';
import QuizItemMixin from 'src/mixins/quizItemMixin';
import ItemQuizLayout from 'components/QuizLayout/ItemQuizLayout.vue';
import { stringToInt } from 'src/utils/number';
import QuizAnswer from 'src/models/QuizAnswer';

@Component({
    components: {
        ItemQuizLayout,
        TableAnswerHistoryItem,
        ListAnswersHistoryItem,
        IconAndInputQuizLayout,
        IconItem,
        ResultQuiz,
    },
})
export default class ItemPriceQuizPage extends Mixins(QuizItemMixin) {
    // region Event handlers

    private onAnswered(answerGivenByPlayer: string, quizAnswer: QuizAnswer) {
        const priceItem: number = stringToInt(quizAnswer.value);
        const priceGivenByPlayer: number = stringToInt(answerGivenByPlayer);

        const score = Math.abs(priceItem - priceGivenByPlayer);

        this.player = { ...this.player, score: this.player.score + score };

        this.onPickNextItem();
    }

    // endregion
}
</script>
