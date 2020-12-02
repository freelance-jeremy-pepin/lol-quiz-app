<template>
    <q-page class="q-pa-md row items-center justify-evenly" style="margin-top: 16px;">
        <div class="row justify-center" style="max-width: 500px; width: 100%;">
            <card-with-title-and-action
                :action-disable="!me || !socketStore.isConnected"
                :center-content="false"
                action-label="Create room"
                style="max-width: 500px;"
                title="Rooms"
                @action="formRoom.display = true"
            >
                <q-card-section v-show="roomsNotInGame.length > 0" class="q-pa-none">
                    <list-rooms ref="listRooms" :rooms="roomsNotInGame"></list-rooms>
                </q-card-section>

                <q-card-section v-if="roomsNotInGame.length < 1">
                    <div class="text-center">No room.</div>
                </q-card-section>
            </card-with-title-and-action>

            <form-room v-model="formRoom.display" v-on:creating-room="onCreatingRoom"></form-room>
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

    private roomToJoin: Room | null = null;

    /**
     * Références des composants enfants.
     */
    public $refs!: {
        listRooms: HTMLFormElement;
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

    // region Events handlers

    private onCreatingRoom(creatingRoom: Room) {
        this.roomToJoin = creatingRoom;
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

            if (this.roomToJoin && this.$refs.listRooms && this.roomToJoin.id === r.id) {
                this.$refs.listRooms.joinRoom(this.roomToJoin);
                this.roomToJoin = null;
            }
        });
    }

    // endregion
}
</script>
