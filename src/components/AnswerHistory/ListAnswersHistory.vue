<template>
    <q-dialog v-model="$attrs.value" v-bind="$attrs" v-on="$listeners">
        <q-card style="max-width: 500px; width: 100%;">
            <q-list>
                <line-answer-history
                    v-for="(playerAnswerHistory, index) in player.answersHistory"
                    :key="playerAnswerHistory.id"
                    :answer-history-item="playerAnswerHistory"
                    :is-answering="playerIsCurrentQuestion(index, player)"
                    :is-last="index === playerAnswerHistory.length - 1"
                    :player-answer-history="playerAnswerHistory"
                    :quiz="quizConfiguration.quiz"
                    :quiz-answer="quizConfiguration.answers[index]"
                >
                    <template slot="left-side">
                        <slot :index="index" name="left-side"></slot>
                    </template>
                </line-answer-history>
            </q-list>
        </q-card>
    </q-dialog>
</template>

<script lang="ts">
import { Mixins, Prop } from 'vue-property-decorator';
import Component from 'vue-class-component';
import LineAnswerHistory from 'components/AnswerHistory/LineAnswerHistory.vue';
import Player from 'src/models/Player';
import PlayerMixin from 'src/mixins/playerMixin';
import IconItem from 'components/Item/IconItem.vue';
import QuizConfiguration from 'src/models/QuizConfiguration';

@Component({
    components: { IconItem, LineAnswerHistory },
})
export default class ListAnswersHistory extends Mixins(PlayerMixin) {
    // region Props

    @Prop({ required: true }) quizConfiguration!: QuizConfiguration;

    @Prop({ required: true }) player!: Player;

    // endregion
}
</script>
