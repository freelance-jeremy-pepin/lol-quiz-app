<template>
    <q-page class="q-pa-md row items-center justify-evenly" style="margin-top: 16px;">
        <div class="column items-center">
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
import { Component, Vue, Prop } from 'vue-property-decorator';
import IconAndInputQuizLayout from 'components/QuizLayout/IconAndInputQuizLayout.vue';
import ImageChampion from 'components/Champion/ImageChampion.vue';
import ChampionLolApi from 'src/models/LolApi/ChampionLolApi';
import QuizChampionStore from 'src/store/modules/QuizChampionStore';
import QuizConfiguration from 'src/models/QuizConfiguration';
import QuizStore from 'src/store/modules/QuizStore';

@Component({
    components: {
        ImageChampion,
        IconAndInputQuizLayout,
    },
})
export default class ChampionQuizLayout extends Vue {
    // region Props

    @Prop({ required: false, default: 1 }) pixelatedValue!: number;

    // endregion

    // region Computed properties

    private get quizConfiguration(): QuizConfiguration {
        return QuizStore.quizConfiguration;
    }

    private get championToGuess(): ChampionLolApi | null {
        return QuizChampionStore.championToGuess;
    }

    // endregion
}
</script>
