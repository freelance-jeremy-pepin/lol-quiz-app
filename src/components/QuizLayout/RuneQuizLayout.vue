<template>
    <q-page class="q-pa-md row items-center justify-evenly" style="margin-top: 16px;">
        <div class="column items-center full-width" style="max-width: 350px;">
            <icon-and-input-quiz-layout
                ref="quiz"
                v-on:verify-answer="$emit('verify-answer')"
            >
                <template v-slot:image>
                    <div v-if="runeToGuess">
                        <icon-rune
                            v-if="questionType === 'icon'"
                            :rune="runeToGuess"
                        ></icon-rune>

                        <div
                            v-if="questionType === 'description' && quizAnswer"
                            v-html="runeToGuess.shortDesc.replaceAll(quizAnswer.value, '???')"
                        ></div>
                    </div>

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
import { Component, Prop, Vue } from 'vue-property-decorator';
import IconAndInputQuizLayout from 'components/QuizLayout/IconAndInputQuizLayout.vue';
import IconRune from 'components/Rune/IconRune.vue';
import RuneLolApi from 'src/models/LolApi/RuneLolApi';
import QuizConfiguration from 'src/models/QuizConfiguration';
import QuizStore from 'src/store/modules/QuizStore';
import QuizAnswer from 'src/models/QuizAnswer';
import { RuneQuestionType } from 'src/models/QuizConfigurationRune';

@Component({
    components: {
        IconRune,
        IconAndInputQuizLayout,
    },
})
export default class RuneQuizLayout extends Vue {
    // region Props

    @Prop({ required: true }) runeToGuess!: RuneLolApi;

    @Prop({ required: true }) questionType!: RuneQuestionType;

    @Prop({ required: true }) quizAnswer!: QuizAnswer;

    // endregion

    // region Computed properties

    private get quizConfiguration(): QuizConfiguration {
        return QuizStore.quizConfiguration;
    }

    // endregion

    // region Hooks

    // noinspection JSUnusedLocalSymbols
    private mounted() {
        QuizStore.setRefQuiz(this.$refs.quiz);
    }

    // endregion
}
</script>
