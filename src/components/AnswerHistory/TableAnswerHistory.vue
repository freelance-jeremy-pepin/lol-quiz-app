<template>
    <q-dialog v-model="$attrs.value" v-bind="$attrs" v-on="$listeners" full-width>
        <q-card :style="`width: ${500 * players.length}px !important;`" class="tableFixHead">
            <q-markup-table bordered dense separator="cell" wrap-cells>
                <thead v-if="!(players.length === 1 && players[0].userId === me.id)">
                    <tr>
                        <th
                            v-for="player in playersOrdered"
                            :key="player.id"
                            class="cell"
                        >
                            <div>
                                {{ getPseudoById(player.userId, true) }}

                                <span v-if="!player.hasFinished">
                                    (playing...)
                                </span>
                            </div>

                            <div>
                                Score: {{ player.score }}
                            </div>
                        </th>
                    </tr>
                </thead>

                <tbody>
                    <tr
                        v-for="(quizAnswer, questionNumber) in quizConfiguration.answers"
                        :key="quizAnswer.id"
                    >
                        <td
                            v-for="player in playersOrdered"
                            :key="player.id"
                            class="cell"
                            style="padding: 0 !important;"
                        >
                            <row-answer-history
                                :player="player"
                                :player-answer-history="player.answersHistory[questionNumber]"
                                :question-number="questionNumber"
                                :quiz-answer="quizAnswer"
                                class="full-height"
                            >
                                <template slot="left-side">
                                    <slot :index="questionNumber" name="left-side"></slot>
                                </template>
                            </row-answer-history>
                        </td>
                    </tr>
                </tbody>
            </q-markup-table>
        </q-card>
    </q-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import UserMixin from 'src/mixins/userMixin';
import RowAnswerHistory from 'components/AnswerHistory/RowAnswerHistory.vue';
import QuizConfiguration from '../../models/QuizConfiguration';
import Player from '../../models/Player';

@Component({
    components: { RowAnswerHistory },
})
export default class TableAnswerHistory extends Mixins(UserMixin) {
    // region Props

    @Prop({ required: true }) quizConfiguration!: QuizConfiguration;

    @Prop({ required: true }) players!: Player[];

    // endregion

    // region Computed properties

    private get playersOrdered(): Player[] {
        // Place le joueur courant en premier.
        const currentPlayer = this.players.filter(p => p.userId === this.me.id);

        const otherPlayers = this.players.filter(p => p.userId !== this.me.id).sort((a, b) => {
            const aPseudo = this.getPseudoById(a.userId);
            const bPseudo = this.getPseudoById(b.userId);

            if (aPseudo < bPseudo) {
                return -1;
            }

            if (aPseudo > bPseudo) {
                return 1;
            }

            return 0;
        });

        return [...currentPlayer, ...otherPlayers];
    }

    // endregion
}
</script>

<style scoped>
    th {
        width: 500px;
    }

    td {
        width: 655px;
    }

    table tbody, table thead {
        display: block;
    }

    table tbody {
        overflow: auto;
        height: 500px;
    }
</style>
