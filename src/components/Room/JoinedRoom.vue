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
            <q-card-section align="center" class="q-pb-lg">
                <form-quiz-configuration
                    v-model="room.quizConfiguration"
                    :read-only="room.ownerId !== me.id"
                    v-on:form-changed="onFormQuizConfigurationChanged"
                ></form-quiz-configuration>
            </q-card-section>

            <q-separator></q-separator>

            <q-card-section class="text-center">
                <div class="text-bold text-h6">
                    Players ({{ room.players.length }}):
                </div>

                <div
                    v-for="player in room.players"
                    :key="player.id"
                    :class="`text-bold text-${$options.filters.transformIsReadyIntoColor(player.isReady)}`"
                >
                    {{ getPseudoById(player.userId) }}
                </div>
            </q-card-section>
        </card-with-title-and-action>

        <q-btn class="full-width" color="grey" flat @click="onLeaveRoom">Leave room</q-btn>

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
import FormQuizConfiguration from 'components/QuizConfiguration/FormQuizConfiguration.vue';

@Component({
    components: { FormQuizConfiguration, FormRoom, CardWithTitleAndAction },
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

    public onKeyPress(e: KeyboardEvent) {
        if (e.key === 'r') {
            this.onToggleIsReady();
        }
    }

    private onFormQuizConfigurationChanged() {
        this.room.quizConfiguration = this.specialiseQuizConfiguration(this.room.quizConfiguration);

        this.roomSocketStore.createOrUpdateRoom(this.room);
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
