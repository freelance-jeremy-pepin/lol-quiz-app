<template>
    <q-dialog v-model="$attrs.value" v-bind="$attrs" v-on="$listeners">
        <q-card style="max-width: 500px; width: 100%;">
            <q-list>
                <line-answer-history-item
                    v-for="(playerAnswerHistory, index) in player.answersHistory"
                    :key="playerAnswerHistory.id"
                    :answer-history-item="playerAnswerHistory"
                    :is-answering="playerIsCurrentQuestion(index, player)"
                    :is-last="index === playerAnswerHistory.length - 1"
                    :item="quizConfigurationItem.items[index]"
                    :player-answer-history="playerAnswerHistory"
                    :quiz-answer="quizConfigurationItem.answers[index]"
                ></line-answer-history-item>
            </q-list>
        </q-card>
    </q-dialog>
</template>

<script lang="ts">
import { Mixins, Prop } from 'vue-property-decorator';
import Component from 'vue-class-component';
import LineAnswerHistoryItem from 'components/AnswerHistoryItem/LineAnswerHistoryItem.vue';
import QuizConfigurationItem from 'src/models/QuizConfigurationItem';
import Player from 'src/models/Player';
import PlayerMixin from 'src/mixins/playerMixin';

@Component({
    components: { LineAnswerHistoryItem },
})
export default class ListAnswersHistoryItem extends Mixins(PlayerMixin) {
    // region Props

    @Prop({ required: true }) quizConfigurationItem!: QuizConfigurationItem;

    @Prop({ required: true }) player!: Player;

    // endregion
}
</script>
