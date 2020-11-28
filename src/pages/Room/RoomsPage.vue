<template>
    <q-page class="q-pa-md row items-center justify-evenly" style="margin-top: 16px;">
        <div class="row justify-center" style="max-width: 500px; width: 100%;">
            <card-with-title-and-action
                :action-disable="!me || !socketStore.isConnected"
                :center-content="false"
                style="max-width: 500px;"
                action-label="Create room"
                title="Rooms"
                @action="formRoom.display = true"
            >
                <q-card-section v-if="roomsNotInGame.length > 0" class="q-pa-none">
                    <list-rooms :rooms="roomsNotInGame"></list-rooms>
                </q-card-section>

                <q-card-section v-else>
                    <div class="text-center">No room.</div>
                </q-card-section>
            </card-with-title-and-action>

            <form-room v-model="formRoom.display"></form-room>
        </div>
    </q-page>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator';
import FormRoom from 'components/Room/FormRoom.vue';
import ListRooms from 'components/Room/ListRooms.vue';
import Room, { createDefaultRoom } from 'src/models/Room';
import SocketMixin from 'src/mixins/socketMixin';
import CardWithTitleAndAction from 'components/Common/CardWithTitleAndAction.vue';
import UserMixin from 'src/mixins/userMixin';

@Component({
    components: { CardWithTitleAndAction, ListRooms, FormRoom },
})
export default class RoomsPage extends Mixins(UserMixin, SocketMixin) {
    // region Data

    private formRoom: { display: boolean, room: Room } = {
        display: false,
        room: createDefaultRoom(),
    };

    // endregion

    // region Computed properties

    private get rooms(): Room[] {
        return this.roomSocketStore.rooms;
    }

    private get roomsNotInGame(): Room[] {
        return this.roomSocketStore.roomsNotInGame;
    }

    // endregion

    // region Hooks

    // noinspection JSUnusedLocalSymbols
    private mounted() {
        this.roomSocketStore.getAllRooms();
    }

    // endregion

    // region Watchers

    /**
     * Dès que les salles changent, vérifie que l'utilisateur n'a pas rejoint une salle pour le rediriger vers la salle.
     * @private
     */
    @Watch('rooms')
    private onRoomsChanged() {
        this.rooms.forEach(r => {
            r.players.forEach(p => {
                if (p.userId === this.me?.id && !p.hasFinished) {
                    this.$router.push({
                        path: `/room/${r.id}`,
                    });
                }
            });
        });
    }

    // endregion
}
</script>
