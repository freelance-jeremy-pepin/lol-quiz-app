<template>
    <q-page class="q-pa-md row items-center justify-evenly" style="margin-top: 16px;">
        <div class="column items-center">
            <icon-and-input-quiz-layout
                ref="quiz"
                v-model="answerGivenByPlayer"
                v-on:answered="(playerAnswer, quizAnswer) => $emit('answered', playerAnswer, quizAnswer)"
                v-on:skip="onSkipChampion"
                v-on:correct-answer="$emit('correct-answer')"
                v-on:play-again="onStartNewQuiz"
                v-on:view-history="onModalToggleAnswersHistory"
                v-on:view-all-histories="onToggleModalAnswersAllHistories"
            >
                <template v-slot:image>
                    <splash-art-champion
                        v-if="championToGuess"
                        :champion="championToGuess"
                        :pixelate-value="pixelatedValue"
                    ></splash-art-champion>
                </template>
            </icon-and-input-quiz-layout>

            <list-answers-history
                v-model="modalAnswersHistory.display"
                :player="modalAnswersHistory.player"
                :quiz-configuration="quizConfiguration"
            >
                <template v-slot:left-side="props">
                    <splash-art-champion
                        v-if="quizConfiguration.champions"
                        :champion="quizConfiguration.champions[props.index]"
                        :ratio-image="0.2"
                    ></splash-art-champion>
                </template>
            </list-answers-history>

            <table-answer-history
                v-if="isMultiplayer && room"
                v-model="modalAnswersAllHistories.display"
                :players="room.players"
                :quiz-configuration="quizConfiguration"
            >
                <template v-slot:left-side="props">
                    <splash-art-champion
                        v-if="quizConfiguration.champions"
                        :champion="quizConfiguration.champions[props.index]"
                        :ratio-image="0.2"
                    ></splash-art-champion>
                </template>
            </table-answer-history>
        </div>
    </q-page>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import IconAndInputQuizLayout from 'components/QuizLayout/IconAndInputQuizLayout.vue';
import IconItem from 'components/Item/IconItem.vue';
import QuizChampionMixin from 'src/mixins/quizChampionMixin';
import SplashArtChampion from 'components/Champion/SplashArtChampion.vue';
import ListAnswersHistory from 'components/AnswerHistory/ListAnswersHistory.vue';
import TableAnswerHistory from 'components/AnswerHistory/TableAnswerHistory.vue';

@Component({
    components: {
        TableAnswerHistory,
        ListAnswersHistory,
        SplashArtChampion,
        IconItem,
        IconAndInputQuizLayout,
    },
})
export default class ChampionQuizLayout extends Mixins(QuizChampionMixin) {
    // region Props

    @Prop({ required: false, default: 1 }) pixelatedValue!: number;

    // endregion
}
</script>
