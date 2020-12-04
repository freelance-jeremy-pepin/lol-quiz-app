<template>
    <div class="q-gutter-y-sm">
        <card-with-title-and-action
            :center-content="false"
            :subtitle="`${allPlayerHasFinished ? '' : '(provisional)'}`"
            action-label="Play again!"
            style="max-width: 500px;"
            title="Leaderboard"
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
                        <q-item-label
                            :class="{ 'text-green': playerJoinedNextRoom(player), 'text-red': nextRoom && player.hasQuitRoom && !playerJoinedNextRoom(player) }"
                            class="text-bold"
                        >
                            {{ getPseudoById(player.userId) }}
                            <span v-if="!player.hasFinished"> (playing...)</span>
                        </q-item-label>

                        <q-item-label>
                            {{ `Score: ${player.score}${room.quizConfiguration.totalScore ? ` / ${room.quizConfiguration.totalScore}` : ''}` }}
                        </q-item-label>

                        <q-item-label v-if="!player.hasFinished" caption>
                            Current question: {{ player.currentQuestionNumber }} / {{ room.quizConfiguration.numberQuestions }}
                        </q-item-label>
                    </q-item-section>

                    <q-item-section side>
                        <div class="text-grey-8">
                            <q-btn
                                color="accent"
                                flat
                                @click="$emit('view-history', player)"
                            >
                                View history
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

@Component({
    components: { CardWithTitleAndAction },
})
export default class LeaderboardMultiplayer extends Mixins(UserMixin, SocketMixin) {
    // region Props

    @Prop({ required: true }) room!: Room;

    @Prop({ required: true }) nextRoom!: Room;

    @Prop({ required: false, default: false, type: Boolean }) winnerHasLowestScore!: Room;

    // endregion

    // region Computed properties

    private get playersClassement(): Player[] {
        const players = [...this.room.players];

        if (this.winnerHasLowestScore) {
            return players.sort((a, b) => a.score - b.score);
        }

        return players.sort((a, b) => b.score - a.score);
    }

    private get allPlayerHasFinished(): boolean {
        return this.room.players.every(p => p.hasFinished);
    }

    // endregion

    // region Events handlers

    private onRedirectToRooms() {
        this.redirectToRooms();
    }

    // endregion

    // region Methods

    private playerJoinedNextRoom(player: Player) {
        if (this.nextRoom) {
            return !!this.nextRoom.players.find(p => p.userId === player.userId);
        }

        return false;
    }

    private redirectToRooms() {
        this.$router.push({
            path: `/rooms`,
        });
    }

    // endregion
}
</script>
