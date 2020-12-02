<template>
    <q-page class="q-pa-md row items-center justify-evenly" style="margin-top: 16px;">
        <div class="column items-center">
            <icon-and-input-quiz-layout
                ref="quiz"
                v-model="answerGivenByPlayer"
                v-on:answered="(playerAnswer, quizAnswer) => $emit('answered', playerAnswer, quizAnswer)"
                v-on:skip="onSkipChampion"
                v-on:correct-answer="$emit('correct-answer')"
                v-on:play-again="onPlayAgain"
                v-on:view-history="onModalToggleAnswersHistory"
                v-on:view-all-histories="onToggleModalAnswersAllHistories"
            >
                <template v-slot:image>
                    <image-champion
                        v-if="championToGuess"
                        :champion="championToGuess"
                        :image-type="quizConfiguration.imageType"
                        :pixelate-value="pixelatedValue"
                        :ratio-image="0.7"
                    ></image-champion>
                </template>

                <template v-slot:icon-answer-history="props">
                    <image-champion
                        v-if="quizConfiguration.champions"
                        :champion="quizConfiguration.champions[props.index]"
                        :image-type="quizConfiguration.imageType"
                        :ratio-image="0.2"
                    ></image-champion>
                </template>
            </icon-and-input-quiz-layout>
        </div>
    </q-page>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import IconAndInputQuizLayout from 'components/QuizLayout/IconAndInputQuizLayout.vue';
import IconItem from 'components/Item/IconItem.vue';
import QuizChampionMixin from 'src/mixins/quizChampionMixin';
import ImageChampion from 'components/Champion/ImageChampion.vue';

@Component({
    components: {
        ImageChampion,
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
