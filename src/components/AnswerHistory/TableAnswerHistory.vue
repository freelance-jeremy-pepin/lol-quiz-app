<template>
    <q-dialog v-model="$attrs.value" v-bind="$attrs" v-on="$listeners" full-width>
        <div class="full-width">
            <q-markup-table bordered class="text-center" dense separator="cell" wrap-cells>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th
                            v-for="player in players"
                            :key="player.id"
                        >
                            {{ getPseudoById(player.userId) }}
                        </th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="(item, index) in quizConfiguration.answers" :key="item.id">
                        <td class="quiz-answer">
                            <slot :index="index" name="left-side"></slot>
                            <br />
                            <span class="text-bold">Answer: {{ quizConfiguration.answers[index].value }}</span>
                        </td>

                        <td v-for="player in players" :key="player.id" class="player-answer">
                            <div v-if="player.answersHistory[index]">
                                <div v-if="isAnswering(player, index)" class="text-bold">
                                    Answering...
                                </div>

                                <div v-else>
                                    <div v-if="player.answersHistory[index].skipped">
                                        (skipped)
                                    </div>

                                    <div v-if="player.answersHistory[index].timeElapsed">
                                        <span>Time: {{ player.answersHistory[index].timeElapsed | transformTimeIntoString }}</span>
                                    </div>
                                </div>

                                <div v-if="player.answersHistory[index].answers.length > 0">
                                    Player's {{ player.answersHistory[index].answers.length | pluralize('answer', 'answers') }}:

                                    <span
                                        v-for="answer in player.answersHistory[index].answers"
                                        :key="answer.id"
                                        :class="answer.isRight ? 'text-positive' : 'text-negative'"
                                        class="text-bold"
                                    >
                                            [{{ answer.value }}]
                                        </span>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </q-markup-table>
        </div>
    </q-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import Player from 'src/models/Player';
import UserMixin from 'src/mixins/userMixin';
import IconItem from 'components/Item/IconItem.vue';
import QuizConfiguration from 'src/models/QuizConfiguration';
import TimeMixin from 'src/mixins/timeMixin';
import TextFormatMixin from 'src/mixins/textFormat';

@Component({
    components: { IconItem },
})
export default class TableAnswerHistory extends Mixins(UserMixin, TimeMixin, TextFormatMixin) {
    // region Props

    @Prop({ required: true }) quizConfiguration!: QuizConfiguration;

    @Prop({ required: true }) players!: Player[];

    // endregion

    // region Methods

    private isAnswering(player: Player, questionNumber: number): boolean {
        return !player.hasFinished && player.currentQuestionNumber === questionNumber + 1;
    }

    // endregion
}
</script>

<style scoped>
    .player-answer {
        max-width: 100px;
    }

    .quiz-answer {
        width: 250px !important;
    }
</style>
