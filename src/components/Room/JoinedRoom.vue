<template>
    <div class="q-gutter-y-sm" style="max-width: 500px; width: 100%;">
        <card-with-title-and-action
            :action-color="player.isReady | transformIsReadyIntoColor"
            :action-label="player.isReady | transformIsReadyIntoLabel"
            :center-content="false"
            :max-width="500"
            :title="room.name"
            @action="onToggleIsReady"
        >
            <q-card-section>
                <div class="text-bold text-h6">
                    Quiz:
                </div>

                <ul class="q-mt-none">
                    <li> {{ room.quizConfiguration.quiz.name }}</li>
                    <li> {{ room.quizConfiguration.numberQuestions }} questions</li>
                    <li> {{ room.quizConfiguration.withStopWatch | formatWithStopWatch }}</li>
                </ul>
            </q-card-section>

            <q-card-section class="q-pt-none">
                <div class="text-bold text-h6">
                    Players ({{ room.players.length }}):
                </div>

                <div v-for="player in room.players" :key="player.id">
                    {{ getPseudoById(player.userId) }}
                    <span
                        :class="`text-${$options.filters.transformIsReadyIntoColor(player.isReady)}`"
                        class="text-bold"
                    >
                        ({{ player.isReady | transformIsReadyIntoLabel }})
                    </span>
                </div>
            </q-card-section>
        </card-with-title-and-action>

        <q-btn class="full-width" color="grey" flat @click="onLeaveRoom">Leave room</q-btn>
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator';
import Room from 'src/models/Room';
import QuizConfigurationMixin from 'src/mixins/quizConfigurationMixin';
import SocketMixin from 'src/mixins/socketMixin';
import UserMixin from 'src/mixins/userMixin';
import Player from 'src/models/Player';
import CardWithTitleAndAction from 'components/Common/CardWithTitleAndAction.vue';
import PlayerMixin from 'src/mixins/playerMixin';

@Component({
    components: { CardWithTitleAndAction },
})
export default class JoinedRoom extends Mixins(SocketMixin, UserMixin, QuizConfigurationMixin, PlayerMixin) {
    // region Props

    @Prop({ required: true }) room!: Room;

    // endregion

    // region Computed properties

    private get player(): Player | undefined {
        return this.room.players.find(p => p.userId === this.me?.id);
    }

    private get allPlayersAreReady(): boolean {
        if (this.room.players.length > 0) {
            return this.room.players.every(p => p.isReady);
        }

        return false;
    }

    // endregion

    // region Event handlers

    private onLeaveRoom() {
        this.leaveRoom();
    }

    private onToggleIsReady() {
        this.toggleIsReady();
    }

    // endregion

    // region Methods

    private leaveRoom() {
        if (this.player) {
            this.roomSocketStore.leaveRoom({
                roomToLeave: this.room,
                player: this.player,
            });
        }
    }

    private toggleIsReady() {
        if (this.player) {
            const player = { ...this.player, isReady: !this.player?.isReady };
            this.roomSocketStore.updatePlayer({ room: this.room, player });
        }
    }

    // endregion

    // region Watchers

    @Watch('allPlayersAreReady', { immediate: true })
    private onAllPlayersAreReady() {
        if (this.allPlayersAreReady) {
            this.roomSocketStore.createOrUpdateRoom({ ...this.room, inGame: true });

            this.$router.push({
                path: `/quiz/${this.room.quizConfiguration.quiz.internalName}`,
                query: {
                    room: this.room.id.toString(),
                },
            });
        }
    }

    // endregion
}
</script>
