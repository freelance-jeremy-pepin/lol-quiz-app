<template>
    <q-page class="q-pa-md row items-center justify-evenly" style="margin-top: 16px;">
        <div class="column items-center full-width" style="max-width: 350px;">
            <icon-and-input-quiz-layout
                ref="quiz"
                v-on:verify-answer="$emit('verify-answer')"
            >
                <template v-slot:image>
                    <div v-if="championSpellToGuess">
                        <spell-icon-champion
                            v-if="questionType === 'icon'"
                            :champion-spell="championSpellToGuess"
                        ></spell-icon-champion>

                        <div
                            v-if="questionType === 'description' && quizAnswer"
                            v-html="championSpellToGuess.description.replaceAll(quizAnswer.value, '???')"
                        ></div>
                    </div>
                </template>

                <template v-slot:icon-answer-history="props">
                    <spell-icon-champion
                        v-if="quizConfiguration.spells"
                        :champion-spell="quizConfiguration.spells[props.index]"
                        with-tooltip
                    ></spell-icon-champion>
                </template>
            </icon-and-input-quiz-layout>
        </div>
    </q-page>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import IconAndInputQuizLayout from 'components/QuizLayout/IconAndInputQuizLayout.vue';
import QuizConfiguration from 'src/models/QuizConfiguration';
import QuizStore from 'src/store/modules/QuizStore';
import SpellIconChampion from 'components/Champion/SpellIconChampion.vue';
import ChampionSpellLolApi from 'src/models/LolApi/ChampionSpellLolApi';
import { ChampionSpellQuestionType } from 'src/models/QuizConfigurationChampionSpell';
import QuizAnswer from 'src/models/QuizAnswer';

@Component({
    components: {
        SpellIconChampion,
        IconAndInputQuizLayout,
    },
})
export default class ChampionSpellQuizLayout extends Vue {
    // region Props

    @Prop({ required: true }) championSpellToGuess!: ChampionSpellLolApi;

    @Prop({ required: true }) questionType!: ChampionSpellQuestionType;

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
