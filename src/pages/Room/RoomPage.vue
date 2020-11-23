<template>
    <q-page class="q-pa-md row items-center justify-evenly" style="margin-top: 16px;">
        <joined-room v-if="room" :room="room"></joined-room>
        <div v-else class="text-negative text-bold">No room found.</div>
    </q-page>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator';
import JoinedRoom from 'components/Room/JoinedRoom.vue';
import Room from 'src/models/Room';
import SocketMixin from 'src/mixins/socketMixin';
import UserMixin from 'src/mixins/userMixin';

@Component({
    components: { JoinedRoom },
})
export default class RoomPage extends Mixins(SocketMixin, UserMixin) {
    // region Props

    // endregion

    // region Data

    // endregion

    // region Computed properties

    private get room(): Room | undefined | null {
        return this.roomSocketStore.room;
    }

    // endregion

    // region Hooks

    private mounted() {
        this.roomSocketStore.getRoomById({ id: this.$route.params.id, user: this.me });
    }

    // endregion

    // region Event handlers

    // endregion

    // region Methods

    // endregion

    // region Watchers

    /**
     * Dès que la salle change, vérifie que le joueur appartient bien à la salle.
     * @private
     */
    @Watch('room', { deep: true })
    private onRoomsChanged() {
        if (this.room) {
            const playerFound = this.room.players.find(p => p.userId === this.me.id);

            if (!playerFound) {
                this.$router.push({
                    path: `/rooms`,
                });
            }
        }
    }

    // endregion
}
</script>
