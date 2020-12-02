<template>
    <q-page class="q-pa-md row items-center justify-evenly" style="margin-top: 16px;">
        <div class="column items-center full-width" style="max-width: 350px;">
            <icon-and-input-quiz-layout
                ref="quiz"
                v-model="answerGivenByPlayer"
                :isMultiplayer="isMultiplayer"
                v-on:answered="(playerAnswer, quizAnswer) => $emit('answered', playerAnswer, quizAnswer)"
                v-on:skip="onSkipRune"
                v-on:correct-answer="$emit('correct-answer')"
                v-on:play-again="onStartNewQuiz"
            >
                <template v-slot:image>
                    <icon-rune
                        v-if="runeToGuess"
                        :rune="runeToGuess"
                    ></icon-rune>
                </template>

                <template v-slot:icon-answer-history="props">
                    <icon-rune
                        v-if="quizConfiguration.runes"
                        :rune="quizConfiguration.runes[props.index]"
                    ></icon-rune>
                </template>
            </icon-and-input-quiz-layout>
        </div>
    </q-page>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import IconAndInputQuizLayout from 'components/QuizLayout/IconAndInputQuizLayout.vue';
import IconRune from 'components/Rune/IconRune.vue';
import QuizRuneMixin from 'src/mixins/quizRuneMixin';

@Component({
    components: {
        IconRune,
        IconAndInputQuizLayout,
    },
})
export default class RuneQuizLayout extends Mixins(QuizRuneMixin) {

}
</script>
