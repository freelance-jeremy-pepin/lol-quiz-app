<template>
    <q-page class="q-pa-md row items-center justify-evenly" style="margin-top: 16px;">
        <div class="column items-center full-width" style="max-width: 350px;">
            <icon-and-input-quiz-layout
                ref="quiz"
                v-on:verify-answer="$emit('verify-answer')"
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
import { Component, Prop, Vue } from 'vue-property-decorator';
import IconAndInputQuizLayout from 'components/QuizLayout/IconAndInputQuizLayout.vue';
import IconItem from 'components/Item/IconItem.vue';
import ItemLolApi from 'src/models/LolApi/ItemLolApi';
import QuizConfiguration from 'src/models/QuizConfiguration';
import QuizStore from 'src/store/modules/QuizStore';
import QuizStageStore from 'src/store/modules/QuizStageStore';

@Component({
    components: {
        IconItem,
        IconAndInputQuizLayout,
    },
})
export default class ItemQuizLayout extends Vue {
    // region Props

    @Prop({ required: true }) itemToGuess!: ItemLolApi;

    // endregion

    // region Computed properties

    private get quizConfiguration(): QuizConfiguration {
        return QuizStore.quizConfiguration;
    }

    private get quizStageStore(): typeof QuizStageStore {
        return QuizStageStore;
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
