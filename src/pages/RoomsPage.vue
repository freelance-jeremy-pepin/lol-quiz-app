<template>
    <q-page class="q-pa-md row items-center justify-evenly" style="margin-top: 16px;">
        <div class="row justify-center" style="max-width: 500px; width: 100%;">
            <q-card class="full-width">
                <q-card-section>
                    <list-rooms v-if="rooms.length > 0" :rooms="rooms"></list-rooms>
                    <div v-else class="text-center">No room.</div>
                </q-card-section>

                <q-separator></q-separator>

                <q-card-actions align="right">
                    <q-btn
                        :disable="!user || !socket.isConnected"
                        color="primary"
                        flat
                        @click="formRoom.display = true"
                    >
                        Create room
                    </q-btn>
                </q-card-actions>
            </q-card>

            <form-room v-model="formRoom.display"></form-room>
        </div>
    </q-page>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import FormRoom from 'components/Room/FormRoom.vue';
import ListRooms from 'components/Room/ListRooms.vue';
import Room, { createDefaultRoom } from 'src/models/Room';
import SocketStore from 'src/store/modules/SocketStore';
import { getModule } from 'vuex-module-decorators';
import User from 'src/models/User';
import UserStore from 'src/store/modules/UserStore';

@Component({
    components: { ListRooms, FormRoom },
})
export default class RoomsPage extends Vue {
    // region Data

    private newRoom: Room = createDefaultRoom();

    private socket: SocketStore = getModule(SocketStore, this.$store);

    private formRoom: { display: boolean, room: Room } = {
        display: false,
        room: createDefaultRoom(),
    };

    // endregion

    // region Computed properties

    private get rooms(): Room[] {
        return this.socket.rooms;
    }

    private get user(): User | undefined {
        return UserStore.user;
    }

    // endregion

    // region Hooks

    private mounted() {
        this.socket.getAllRooms();
    }

    // endregion

    // region Events handlers

    private onCreateRoom() {
        this.socket.createRoom(this.newRoom);
        this.newRoom.name = '';
    }

    // endregion
}
</script>
