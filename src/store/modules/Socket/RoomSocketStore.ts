/* eslint-disable camelcase */
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import Room from 'src/models/Room.ts';
import { socket } from 'boot/socket.io';
import Participant from 'src/models/Participant';

@Module({
    name: 'socket/room',
})
export default class RoomSocketStore extends VuexModule {
    // region State

    private _rooms: Room[] = [];

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
    public SOCKET_ROOM_CREATED(room: Room) {
        this._rooms.push(room);
    }

    @Mutation
    public SOCKET_ROOM_DELETED(roomDeleted: Room) {
        this._rooms = this._rooms.filter(r => r.id !== roomDeleted.id);
    }

    @Mutation
    public SOCKET_ROOM_JOINED(payload: { roomJoined: Room, participant: Participant }) {
        this._rooms = this._rooms.map(r => {
            if (r.id === payload.roomJoined.id) {
                r.participants.push(payload.participant);
            }

            return r;
        });
    }

    @Mutation
    public SOCKET_ROOM_LEFT(payload: { roomLeft: Room, participant: Participant }) {
        this._rooms = this._rooms.map(r => {
            if (r.id === payload.roomLeft.id) {
                r.participants = r.participants.filter(p => p.id !== payload.participant.id);
            }

            return r;
        });
    }

    // endregion

    // region Action

    @Action({ rawError: true })
    public getAllRooms() {
        socket.emit('get_all_rooms');
    }

    @Action({ rawError: true })
    public createRoom(newRoom: Room) {
        socket.emit('create_room', newRoom);
    }

    @Action({ rawError: true })
    public deleteRoom(roomToDelete: Room) {
        socket.emit('delete_room', roomToDelete);
    }

    @Action({ rawError: true })
    public joinRoom(payload: { roomToJoin: Room, participant: Participant }) {
        socket.emit('join_room', payload.roomToJoin, payload.participant);
    }

    @Action({ rawError: true })
    public leaveRoom(payload: { roomToLeave: Room, participant: Participant }) {
        socket.emit('leave_room', payload.roomToLeave, payload.participant);
    }

    // endregion

    // region Getters

    public get rooms(): Room[] {
        return this._rooms;
    }

    // endregion
}
