/* eslint-disable camelcase */
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import Room from 'src/models/Room.ts';
import { socket } from 'src/boot/socket.io';

@Module({
    name: 'socket',
    namespaced: true,
})
export default class SocketStore extends VuexModule {
    // region State

    public _rooms: Room[] = [];

    // endregion

    // region Mutations

    @Mutation
    public SOCKET_CONNECT() {
        this._rooms = [];
    }

    @Mutation
    public SOCKET_DISCONNECT() {
        this._rooms = [];
    }

    @Mutation
    public SOCKET_ALL_ROOMS(rooms: Room[]) {
        this._rooms = rooms;
    }

    @Mutation
    public SOCKET_NEW_ROOM(room: Room) {
        this._rooms.push(room);
    }

    // endregion

    // region Action

    @Action
    public getAllRooms() {
        socket.emit('get-all-rooms');
    }

    @Action
    public createRoom(newRoomName: Room) {
        socket.emit('create-room', newRoomName);
    }

    // endregion

    // region Getters

    public get isConnected(): boolean {
        return socket.connected;
    }

    public get rooms(): Room[] {
        return this._rooms;
    }

    // endregion
}
