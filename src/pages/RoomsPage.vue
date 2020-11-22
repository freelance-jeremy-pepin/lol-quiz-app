<template>
    <q-page class="q-pa-md row items-center justify-evenly" style="margin-top: 16px;">
        <joined-room v-if="roomJoined" :room="roomJoined"></joined-room>

        <div v-else class="row justify-center" style="max-width: 500px; width: 100%;">
            <card-with-title-and-action
                :action-disable="!me || !socketStore.isConnected"
                :center-content="false"
                :max-width="500"
                action-label="Create room"
                title="Rooms"
                @action="formRoom.display = true"
            >
                <q-card-section v-if="rooms.length > 0" class="q-pa-none">
                    <list-rooms :rooms="rooms"></list-rooms>
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
import { Component, Mixins } from 'vue-property-decorator';
import FormRoom from 'components/Room/FormRoom.vue';
import ListRooms from 'components/Room/ListRooms.vue';
import Room, { createDefaultRoom } from 'src/models/Room';
import SocketMixin from 'src/mixins/socketMixin';
import JoinedRoom from 'components/Room/JoinedRoom.vue';
import CardWithTitleAndAction from 'components/Common/CardWithTitleAndAction.vue';
import UserMixin from 'src/mixins/userMixin';

@Component({
    components: { CardWithTitleAndAction, JoinedRoom, ListRooms, FormRoom },
})
export default class RoomsPage extends Mixins(UserMixin, SocketMixin) {
    // region Data

    private newRoom: Room = createDefaultRoom();

    private formRoom: { display: boolean, room: Room } = {
        display: false,
        room: createDefaultRoom(),
    };

    // endregion

    // region Computed properties

    private get rooms(): Room[] {
        return this.roomSocketStore.rooms;
    }

    private get roomJoined(): Room | null {
        let roomJoined: Room | null = null;

        this.rooms.forEach(r => {
            r.participants.forEach(p => {
                if (p.userId === this.me?.id) {
                    roomJoined = r;
                }
            });
        });

        return roomJoined;
    }

    // endregion

    // region Hooks

    private mounted() {
        this.roomSocketStore.getAllRooms();
    }

    // endregion

    // region Events handlers

    private onCreateRoom() {
        this.roomSocketStore.createRoom(this.newRoom);
        this.newRoom.name = '';
    }

    // endregion
}
</script>
