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
                v-on:play-again="onPlayAgain"
            >
                <template v-slot:image>
                    <icon-item
                        v-if="itemToGuess"
                        :item="itemToGuess"
                        :with-tooltip="!quizStageStore.isAnswering"
                    ></icon-item>
                </template>

                <template v-slot:icon-answer-history="props">
                    <icon-item
                        v-if="quizConfiguration.items"
                        :item="quizConfiguration.items[props.index]"
                    ></icon-item>
                </template>
            </icon-and-input-quiz-layout>
        </div>
    </q-page>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import QuizItemMixin from 'src/mixins/quizItemMixin';
import IconAndInputQuizLayout from 'components/QuizLayout/IconAndInputQuizLayout.vue';
import IconItem from 'components/Item/IconItem.vue';

@Component({
    components: {
        IconItem,
        IconAndInputQuizLayout,
    },
})
export default class ItemQuizLayout extends Mixins(QuizItemMixin) {

}
</script>
