<template>
    <div class="q-gutter-y-sm">
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
                                @click="$emit('view-history', player)"
                            >View history
                            </q-btn>
                        </div>
                    </q-item-section>
                </q-item>
            </q-list>
        </card-with-title-and-action>

        <q-btn
            class="full-width"
            color="grey"
            flat
            @click="onRedirectToRooms"
        >
            Go to rooms
        </q-btn>
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import SocketMixin from 'src/mixins/socketMixin';
import Room from '../../models/Room';
import CardWithTitleAndAction from '../Common/CardWithTitleAndAction.vue';
import Player from '../../models/Player';
import UserMixin from '../../mixins/userMixin';
import ListAnswersHistoryItem from '../AnswerHistoryItem/ListAnswersHistoryItem.vue';

@Component({
    components: { ListAnswersHistoryItem, CardWithTitleAndAction },
})
export default class LeaderBoardMultiplayer extends Mixins(UserMixin, SocketMixin) {
    // region Props

    @Prop({ required: true }) room!: Room;

    @Prop({ required: false, default: false, type: Boolean }) winnerHasLowestScore!: Room;

    // endregion

    // region Computed properties

    private get playersClassement(): Player[] {
        if (this.winnerHasLowestScore) {
            return this.room.players.sort((a, b) => a.score - b.score);
        }

        return this.room.players.sort((a, b) => b.score - a.score);
    }

    // endregion

    // region Events handlers

    private onRedirectToRooms() {
        this.redirectToRooms();
    }

    // endregion

    // region Methods

    private redirectToRooms() {
        this.$router.push({
            path: `/rooms`,
        });
    }

    // endregion
}
</script>
