<template>
    <q-page class="q-pa-md row items-center justify-evenly" style="margin-top: 16px;">
        <div class="column items-center full-width" style="max-width: 350px;">
            <icon-and-input-quiz-layout
                ref="quiz"
                v-on:answered="$emit('answered')"
                v-on:skip="$emit('skip')"
                v-on:correct-answer="$emit('correct-answer')"
                v-on:play-again="$emit('play-again')"
                v-on:focus-answer-input="$emit('focus-answer-input')"
                v-on:verify-answer="$emit('verify-answer')"
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
import { Component, Vue } from 'vue-property-decorator';
import IconAndInputQuizLayout from 'components/QuizLayout/IconAndInputQuizLayout.vue';
import IconRune from 'components/Rune/IconRune.vue';
import RuneLolApi from 'src/models/LolApi/RuneLolApi';
import QuizRuneStore from 'src/store/modules/QuizRuneStore';
import QuizConfiguration from 'src/models/QuizConfiguration';
import QuizStore from 'src/store/modules/QuizStore';

@Component({
    components: {
        IconRune,
        IconAndInputQuizLayout,
    },
})
export default class RuneQuizLayout extends Vue {
    // region Computed properties

    private get quizConfiguration(): QuizConfiguration {
        return QuizStore.quizConfiguration;
    }

    private get runeToGuess(): RuneLolApi | null {
        return QuizRuneStore.runeToGuess;
    }

    // endregion
}
</script>
