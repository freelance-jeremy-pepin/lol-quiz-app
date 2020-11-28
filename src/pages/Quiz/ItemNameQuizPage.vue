<template>
    <item-quiz-layout v-on:correct-answer="onCorrectAnswer"></item-quiz-layout>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import ResultQuiz from 'components/Quiz/ResultQuiz.vue';
import IconItem from 'components/Item/IconItem.vue';
import IconAndInputQuizLayout from 'components/QuizLayout/IconAndInputQuizLayout.vue';
import ListAnswersHistoryItem from 'components/AnswerHistoryItem/ListAnswersHistory.vue';
import TableAnswerHistoryItem from 'components/AnswerHistoryItem/TableAnswerHistoryItem.vue';
import QuizItemMixin from 'src/mixins/quizItemMixin';
import ItemQuizLayout from 'components/QuizLayout/ItemQuizLayout.vue';

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
export default class ItemNameQuizPage extends Mixins(QuizItemMixin) {
    // region Event handlers

    private onCorrectAnswer() {
        // Si la réponse est correcte, incrémente le score et passe au prochain objet.
        this.player = { ...this.player, score: this.player.score + 1 };

        this.onPickNextItem();
    }

    // endregion
}
</script>
