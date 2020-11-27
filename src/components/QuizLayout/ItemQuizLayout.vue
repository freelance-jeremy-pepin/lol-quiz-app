<template>
    <q-page class="q-pa-md row items-center justify-evenly" style="margin-top: 16px;">
        <div class="column items-center" style="max-width: 350px; width: 100%;">
            <icon-and-input-quiz-layout
                ref="quiz"
                v-model="answerGivenByPlayer"
                :isMultiplayer="isMultiplayer"
                :quiz-configuration="quizConfiguration"
                v-on:answered="(playerAnswer, quizAnswer) => $emit('answered', playerAnswer, quizAnswer)"
                v-on:skip="onSkipItem"
                v-on:correct-answer="$emit('correct-answer')"
                v-on:toggle-history="onModalToggleAnswersHistory(null)"
                v-on:play-again="onStartNewQuiz"
                v-on:view-history="onModalToggleAnswersHistory"
            >
                <template v-slot:image>
                    <icon-item
                        v-if="itemToGuess"
                        :item="itemToGuess"
                        :with-tooltip="!quizStageStore.isAnswering"
                    ></icon-item>
                </template>
            </icon-and-input-quiz-layout>

            <list-answers-history-item
                v-if="true || !isMultiplayer"
                v-model="modalAnswersHistory.display"
                :player="modalAnswersHistory.player"
                :quiz-configuration-item="quizConfiguration"
            ></list-answers-history-item>

            <table-answer-history-item
                v-if="false && isMultiplayer && room"
                v-model="modalAnswersHistory.display"
                :players="room.players"
                :quiz-configuration-item="quizConfiguration"
            ></table-answer-history-item>
        </div>
    </q-page>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import QuizItemMixin from 'src/mixins/quizItemMixin';
import IconAndInputQuizLayout from 'components/QuizLayout/IconAndInputQuizLayout.vue';
import ListAnswersHistoryItem from 'components/AnswerHistoryItem/ListAnswersHistoryItem.vue';
import TableAnswerHistoryItem from 'components/AnswerHistoryItem/TableAnswerHistoryItem.vue';
import IconItem from 'components/Item/IconItem.vue';

@Component({
    components: {
        IconItem,
        TableAnswerHistoryItem,
        ListAnswersHistoryItem,
        IconAndInputQuizLayout,
    },
})
export default class ItemQuizLayout extends Mixins(QuizItemMixin) {

}
</script>
