<template>
    <q-card>
        <q-card-section class="q-gutter-md">
            <q-input v-model="newRoomName" outlined></q-input>
            <q-btn :disable="!socketConnected" color="primary" @click="onCreateRoom">Create</q-btn>
        </q-card-section>

        <q-card-section>
            <div v-for="room in rooms" :key="room">
                {{ room }}
            </div>
        </q-card-section>
    </q-card>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import { Vue } from 'vue-property-decorator';
import { Socket } from 'vue-socket.io-extended';

@Component
export default class SelectRoomMultiplayer extends Vue {
    // region Data

    private newRoomName: string = '';

    private rooms: string[] = [];

    // endregion

    // region Computed properties

    private get socketConnected(): boolean {
        return this.$socket.connected;
    }

    // endregion

    // region Hooks

    private mounted() {
        this.$socket.client.emit('get-all-rooms');
    }

    // endregion

    // region Events handlers

    private onCreateRoom() {
        this.$socket.client.emit('create-room', this.newRoomName);
        this.newRoomName = '';
    }

    @Socket('new-room')
    private onNewRoom(newRoomName: string) {
        this.rooms.push(newRoomName);
    }

    @Socket('all-rooms')
    private onAllRoom(rooms: string[]) {
        this.rooms = rooms;
    }

    @Socket('connection')
    private onConnect() {
        console.log('connect');
        this.rooms = [];
    }

    @Socket('disconnect')
    private onDisconnect() {
        this.rooms = [];
    }

    // endregion
}
</script>
