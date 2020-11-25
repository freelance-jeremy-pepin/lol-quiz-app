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
                    <td>
                        <icon-item :item="item" with-tooltip></icon-item>
                        <br />
                        <span class="text-bold">Answer: {{ item.name }}</span>
                    </td>
                    <td
                        v-for="player in players"
                        :key="player.id"
                    >
                        <div v-if="player.answersHistoryItem[index]">
                            <div v-if="player.answersHistoryItem[index].skipped">
                                (skipped)

                                <div
                                    v-if="player.answersHistoryItem[index].answers.length < 1"
                                    class="text-italic"
                                >
                                    You didn't even try!
                                </div>
                            </div>

                            <span
                                v-for="answer in player.answersHistoryItem[index].answers"
                                :key="answer.id"
                                :class="answer.isRight ? 'text-positive' : 'text-negative'"
                                class="text-bold"
                            >
                                [{{ answer.answer }}]
                            </span>

                            <span
                                v-if="player.answersHistoryItem[index].isAnswering"
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
import AnswerHistoryItem from 'src/models/AnswerHistoryItem';

@Component({
    components: { IconItem },
})
export default class TableAnswerHistoryItem extends Mixins(UserMixin) {
    // region Props

    @Prop({ required: true }) quizConfigurationItem!: QuizConfigurationItem;

    @Prop({ required: true }) players!: Player[];

    // endregion

    // region Data

    // endregion

    // region Computed properties

    // endregion

    // region Hooks

    // endregion

    // region Event handlers

    // endregion

    // region Methods

    // TODO: élément partagé avec LineAnswerHistoryItem
    private backgroundColor(answerHistoryItem: AnswerHistoryItem): string {
        if (answerHistoryItem.found) {
            return 'bg-green-2';
        }

        if (answerHistoryItem.isAnswering) {
            return 'bg-yellow-2';
        }

        return 'bg-red-2';
    }

    // endregion

    // region Watchers

    // endregion
}
</script>

<style scoped>
    table {
        border-collapse: collapse;
        table-layout: fixed;
        width: 310px;
    }

    table td {
        width: 100px;
        word-wrap: break-word;
    }
</style>
