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
                    <tr v-for="(item, index) in quizConfigurationItem.items" :key="item.id">
                        <td class="quiz-answer">
                            <icon-item :item="item" with-tooltip></icon-item>
                            <br />
                            <span class="text-bold">Answer: {{ quizConfigurationItem.answers[index].value }}</span>
                        </td>

                        <td v-for="player in players" :key="player.id" class="player-answer">
                            <div v-if="player.answersHistory[index]">
                                <div v-if="player.answersHistory[index].skipped">
                                    (skipped)

                                    <div
                                        v-if="player.answersHistory[index].answers.length < 1"
                                        class="text-italic"
                                    >
                                        You didn't even try!
                                    </div>
                                </div>

                                <span
                                    v-for="answer in player.answersHistory[index].answers"
                                    :key="answer.id"
                                    :class="answer.isRight ? 'text-positive' : 'text-negative'"
                                    class="text-bold"
                                >
                                    [{{ answer.value }}]
                                </span>

                                <span
                                    v-if="player.answersHistory[index].isAnswering"
                                    class="text-bold"
                                >
                                    ???
                                </span>
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
import QuizConfigurationItem from 'src/models/QuizConfigurationItem';
import IconItem from 'components/Item/IconItem.vue';

@Component({
    components: { IconItem },
})
export default class TableAnswerHistoryItem extends Mixins(UserMixin) {
    // region Props

    @Prop({ required: true }) quizConfigurationItem!: QuizConfigurationItem;

    @Prop({ required: true }) players!: Player[];

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
