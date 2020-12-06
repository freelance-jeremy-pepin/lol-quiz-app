<template>
    <q-page class="q-pa-md row items-center justify-evenly" style="margin-top: 16px;">
        <div class="column items-center full-width" style="max-width: 350px;">
            <icon-and-input-quiz-layout
                ref="quiz"
                v-on:verify-answer="$emit('verify-answer')"
            >
                <template v-slot:image>
                    <spell-icon-champion
                        v-if="championSpellToGuess"
                        :champion-spell="championSpellToGuess"
                    ></spell-icon-champion>
                </template>

                <template v-slot:icon-answer-history="props">
                    <spell-icon-champion
                        v-if="quizConfiguration.champions"
                        :champion-spell="getChampionSpell(props.index)"
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
import QuizConfigurationChampion from 'src/models/QuizConfigurationChampion';

@Component({
    components: {
        SpellIconChampion,
        IconAndInputQuizLayout,
    },
})
export default class ItemQuizLayout extends Vue {
    // region Props

    @Prop({ required: true }) championSpellToGuess!: ChampionSpellLolApi;

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

    // region Methods

    private getChampionSpell(questionIndex: number): ChampionSpellLolApi | null {
        const quizConfigurationChampion = this.quizConfiguration as QuizConfigurationChampion;

        if (quizConfigurationChampion.spells) {
            return quizConfigurationChampion.spells[questionIndex];
        }

        return null;
    }

    // endregion
}
</script>
