<template>
    <div>
        <card-with-title-and-action
            :center-content="false"
            :max-width="500"
            action-label="Play again!"
            title="Leader board"
            @action="$emit('play-again')"
        >
            <q-list separator>
                <q-item
                    v-for="(player, index) in playersClassement"
                    :key="player.id"
                    class="q-pa-md"
                >
                    <q-item-section side>
                        #{{ index + 1 }}
                    </q-item-section>

                    <q-item-section>
                        <q-item-label class="text-bold">
                            {{ getPseudoById(player.userId) }}
                        </q-item-label>
                        <q-item-label caption>(score: {{ player.score }})</q-item-label>
                    </q-item-section>

                    <q-item-section side>
                        <div class="text-grey-8">
                            <q-btn
                                color="accent"
                                flat
                                @click="onViewHistoryPlayer(player)"
                            >View history
                            </q-btn>
                        </div>
                    </q-item-section>
                </q-item>
            </q-list>
        </card-with-title-and-action>

        <list-answers-history-item
            v-model="listAnswerHistoryItem.display"
            :answers-history-item="listAnswerHistoryItem.player.answersHistoryItem"
        ></list-answers-history-item>
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator';
import Room from '../../models/Room';
import CardWithTitleAndAction from '../Common/CardWithTitleAndAction.vue';
import Player, { createDefaultPlayer } from '../../models/Player';
import UserMixin from '../../mixins/userMixin';
import ListAnswersHistoryItem from '../AnswerHistoryItem/ListAnswersHistoryItem.vue';

@Component({
    components: { ListAnswersHistoryItem, CardWithTitleAndAction },
})
export default class LeaderBoardMultiplayer extends Mixins(UserMixin) {
    // region Props

    @Prop({ required: true }) room!: Room;

    // endregion

    // region Data

    private listAnswerHistoryItem: { display: boolean, player: Player } = {
        display: false,
        player: createDefaultPlayer(),
    };

    // endregion

    // region Computed properties

    private get playersClassement(): Player[] {
        return this.room.players.sort((a, b) => b.score - a.score);
    }

    // endregion

    // region Events handlers

    private onViewHistoryPlayer(player: Player) {
        this.viewHistoryPlayer(player);
    }

    // endregion

    // region Methods

    private viewHistoryPlayer(player: Player) {
        this.listAnswerHistoryItem = {
            player,
            display: true,
        };
    }

    // endregion

    // region Watchers

    /**
     * Dès que la salle change et si l'historique des réponses est ouverte, met à jour l'historique.
     * @private
     */
    @Watch('room', { deep: true })
    private onRoomChanged() {
        if (this.listAnswerHistoryItem.display) {
            const playerFound = this.room.players.find(p => p.id === this.listAnswerHistoryItem.player.id);

            if (playerFound) {
                this.listAnswerHistoryItem.player = playerFound;
            }
        }
    }

    // endregion
}
</script>
