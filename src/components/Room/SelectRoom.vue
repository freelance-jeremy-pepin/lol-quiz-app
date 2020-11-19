<template>
    <div>
        <q-card class="q-pa-md q-gutter-y-md">
            <q-input v-model="newRoom.name" outlined></q-input>
            <q-btn color="primary" @click="onCreateRoom">Create room</q-btn>

            <div v-for="room in rooms" :key="room.name"> {{ room.name }}</div>
        </q-card>

        <form-room v-model="formRoom.display"></form-room>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import { Vue } from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
import SocketStore from 'src/store/modules/SocketStore';
import Room, { createDefaultRoom } from 'src/models/Room';
import FormRoom from 'components/Room/FormRoom.vue';

@Component({
    components: { FormRoom },
})
export default class SelectRoom extends Vue {
    // region Data

    private newRoom: Room = createDefaultRoom();

    private socket: SocketStore = getModule(SocketStore, this.$store);

    private formRoom: { display: boolean, room: Room } = {
        display: true,
        room: createDefaultRoom(),
    };

    // endregion

    // region Computed properties

    private get rooms(): Room[] {
        return this.socket.rooms;
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
