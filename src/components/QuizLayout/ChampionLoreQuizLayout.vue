<template>
    <q-page class="q-pa-md row items-center justify-evenly" style="margin-top: 16px;">
        <div class="column items-center full-width" style="max-width: 350px;">
            <icon-and-input-quiz-layout
                ref="quiz"
                v-on:verify-answer="$emit('verify-answer')"
            >
                <template v-slot:image>
                    <div
                        v-if="championToGuess"
                        v-html="championToGuess.lore.replaceAll(quizAnswer.value, '???')"
                    ></div>
                </template>

                <template v-slot:icon-answer-history="props">
                    <image-champion
                        v-if="quizConfiguration.champions"
                        :champion="quizConfiguration.champions[props.index]"
                        :ratio-image="0.5"
                        image-type="portrait"
                        lore-as-tooltip
                    >
                    </image-champion>
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
import ChampionLolApi from 'src/models/LolApi/ChampionLolApi';
import ImageChampion from 'components/Champion/ImageChampion.vue';
import QuizAnswer from 'src/models/QuizAnswer';

@Component({
    components: {
        ImageChampion,
        IconAndInputQuizLayout,
    },
})
export default class ChampionLoreQuizLayout extends Vue {
    // region Props

    @Prop({ required: true }) championToGuess!: ChampionLolApi;

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
