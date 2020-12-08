<template>
    <div class="q-gutter-y-sm" style="max-width: 500px; width: 100%;">
        <card-with-title-and-action
            v-if="player"
            :action-color="player.isReady | transformIsReadyIntoColor"
            :action-label="player.isReady | transformIsReadyIntoLabel"
            :center-content="false"
            :title="room.name"
            style="max-width: 500px;"
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
                    <li v-if="room.quizConfiguration.imageType"> Image type: {{ room.quizConfiguration.imageType }}</li>
                    <li v-if="room.quizConfiguration.skins"> Skins: {{ room.quizConfiguration.skins }}</li>
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

        <q-page-sticky v-if="room.ownerId === me.id" :offset="[18, 18]" position="bottom-right">
            <q-btn color="accent" fab icon="edit" @click="onEditRoom" />
        </q-page-sticky>

        <form-room v-model="formRoom.display" :room="formRoom.room" edit-mode></form-room>
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator';
import Room, { createDefaultRoom } from 'src/models/Room';
import QuizConfigurationMixin from 'src/mixins/quizConfigurationMixin';
import SocketMixin from 'src/mixins/socketMixin';
import UserMixin from 'src/mixins/userMixin';
import Player from 'src/models/Player';
import CardWithTitleAndAction from 'components/Common/CardWithTitleAndAction.vue';
import PlayerMixin from 'src/mixins/playerMixin';
import FormRoom from 'components/Room/FormRoom.vue';

@Component({
    components: { FormRoom, CardWithTitleAndAction },
})
export default class JoinedRoom extends Mixins(SocketMixin, UserMixin, QuizConfigurationMixin, PlayerMixin) {
    // region Props

    @Prop({ required: true }) room!: Room;

    // endregion

    // region Data

    private formRoom: { display: boolean, room: Room } = {
        display: false,
        room: createDefaultRoom(),
    };

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

    /**
     * Permet de savoir si le joueur a été redirigé vers le quiz ou non.
     * Cela permet d'éviter que l'utilisateur soit rediriger à plusieurs reprises.
     * @private
     */
    private redirected: boolean = false;

    // endregion

    // region Hooks

    // noinspection JSUnusedLocalSymbols
    private mounted() {
        window.addEventListener('keydown', this.onKeyPress);
    }

    // noinspection JSUnusedLocalSymbols
    private beforeDestroy() {
        window.removeEventListener('keydown', this.onKeyPress);
    }

    // endregion

    // region Event handlers

    private onLeaveRoom() {
        this.leaveRoom();
    }

    private onToggleIsReady() {
        this.toggleIsReady();
    }

    private onEditRoom() {
        this.formRoom = {
            room: this.room,
            display: true,
        };
    }

    public onKeyPress(e: KeyboardEvent) {
        if (e.key === 'r') {
            this.onToggleIsReady();
        }
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

    private redirectToQuiz() {
        // Si tous les joueurs sont prêts, ou que le joueur était en partie, redirige vers le quiz.
        if (!this.redirected && (this.allPlayersAreReady || (this.allPlayersAreReady && this.player && this.player.isReady && !this.player.hasFinished))) {
            this.redirected = true;
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

    // region Watchers

    @Watch('player', { immediate: true })
    private onPlayerChanged() {
        this.redirectToQuiz();
    }

    @Watch('allPlayersAreReady', { immediate: true })
    private onAllPlayersAreReadyChanged() {
        this.redirectToQuiz();
    }

    // endregion
}
</script>
