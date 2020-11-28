<template>
    <q-page class="q-pa-md row items-center justify-evenly" style="margin-top: 16px;">
        <div class="column items-center full-width" style="max-width: 350px;">
            <icon-and-input-quiz-layout
                ref="quiz"
                v-model="answerGivenByPlayer"
                :isMultiplayer="isMultiplayer"
                v-on:answered="(playerAnswer, quizAnswer) => $emit('answered', playerAnswer, quizAnswer)"
                v-on:skip="onSkipItem"
                v-on:correct-answer="$emit('correct-answer')"
                v-on:toggle-history="onModalToggleAnswersHistory(null)"
                v-on:play-again="onStartNewQuiz"
                v-on:view-history="onModalToggleAnswersHistory"
                v-on:view-all-histories="onToggleModalAnswersAllHistories"
            >
                <template v-slot:image>
                    <icon-item
                        v-if="itemToGuess"
                        :item="itemToGuess"
                        :with-tooltip="!quizStageStore.isAnswering"
                    ></icon-item>
                </template>
            </icon-and-input-quiz-layout>

            <list-answers-history
                v-model="modalAnswersHistory.display"
                :player="modalAnswersHistory.player"
                :quiz-configuration="quizConfiguration"
            >
                <template v-slot:left-side="props">
                    <icon-item
                        v-if="quizConfiguration.items"
                        :item="quizConfiguration.items[props.index]"
                    ></icon-item>
                </template>
            </list-answers-history>

            <table-answer-history
                v-if="isMultiplayer && room"
                v-model="modalAnswersAllHistories.display"
                :players="room.players"
                :quiz-configuration="quizConfiguration"
            >
                <template v-slot:left-side="props">
                    <icon-item
                        v-if="quizConfiguration.items"
                        :item="quizConfiguration.items[props.index]"
                    ></icon-item>
                </template>
            </table-answer-history>
        </div>
    </q-page>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import QuizItemMixin from 'src/mixins/quizItemMixin';
import IconAndInputQuizLayout from 'components/QuizLayout/IconAndInputQuizLayout.vue';
import ListAnswersHistory from 'components/AnswerHistory/ListAnswersHistory.vue';
import IconItem from 'components/Item/IconItem.vue';
import TableAnswerHistory from 'components/AnswerHistory/TableAnswerHistory.vue';

@Component({
    components: {
        TableAnswerHistory,
        IconItem,
        ListAnswersHistory,
        IconAndInputQuizLayout,
    },
})
export default class ItemQuizLayout extends Mixins(QuizItemMixin) {

}
</script>
