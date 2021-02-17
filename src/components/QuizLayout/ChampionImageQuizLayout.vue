<template>
    <q-page class="q-pa-md row items-center justify-evenly" style="margin-top: 16px;">
        <div class="column items-center">
            <icon-and-input-quiz-layout
                ref="quiz"
                v-on:verify-answer="$emit('verify-answer')"
            >
                <template v-slot:image>
                    <image-champion
                        v-if="championToGuess"
                        :champion="championToGuess"
                        :image-type="quizConfiguration.imageType"
                        :pixelate-value="pixelatedValue"
                        :ratio-image="quizConfiguration.imageType === 'portrait' ? 1 : 0.7"
                        :skin-number="skinNumber"
                        v-on:image-loaded="$emit('image-champion-loaded')"
                    ></image-champion>
                </template>

                <template v-slot:icon-answer-history="props">
                    <image-champion
                        v-if="quizConfiguration.champions"
                        :champion="quizConfiguration.champions[props.index]"
                        :image-type="quizConfiguration.imageType"
                        :ratio-image="quizConfiguration.imageType === 'portrait' ? 0.7 : 0.2"
                        :skin-number="quizConfiguration.skinsIndex[props.index]"
                    ></image-champion>
                </template>
            </icon-and-input-quiz-layout>
        </div>
    </q-page>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import IconAndInputQuizLayout from 'components/QuizLayout/IconAndInputQuizLayout.vue';
import ImageChampion from 'components/Champion/ImageChampion.vue';
import ChampionLolApi from 'src/models/LolApi/ChampionLolApi';
import QuizConfiguration from 'src/models/QuizConfiguration';
import QuizStore from 'src/store/modules/QuizStore';

@Component({
    components: {
        ImageChampion,
        IconAndInputQuizLayout,
    },
})
export default class ChampionImageQuizLayout extends Vue {
    // region Props

    @Prop({ required: true }) championToGuess!: ChampionLolApi;

    @Prop({ required: true }) skinNumber!: number;

    @Prop({ required: false, default: 1 }) pixelatedValue!: number;

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
