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
        const indexToRemove = this._rooms.findIndex(r => r.id === roomDeleted.id);
        this._rooms.splice(indexToRemove, 1);
    }

    @Mutation
    public SOCKET_ROOM_JOINED(roomJoined: Room, participant: Participant) {
        const roomJoinedFound = this._rooms.find(r => r.id === roomJoined.id);

        if (roomJoinedFound) {
            roomJoinedFound.participants.push(participant);
        }
    }

    @Mutation
    public SOCKET_ROOM_LEFT(roomLeft: Room, participant: Participant) {
        const roomLeftFound = this._rooms.find(r => r.id === roomLeft.id);

        if (roomLeftFound) {
            const participantIndexToRemove = roomLeftFound.participants.findIndex(p => p.id === participant.id);

            if (participantIndexToRemove > -1) {
                roomLeftFound.participants.splice(participantIndexToRemove, 1);
            }
        }
    }

    // endregion

    // region Action

    @Action
    public getAllRooms() {
        socket.emit('get_all_rooms');
    }

    @Action
    public createRoom(newRoom: Room) {
        socket.emit('create_room', newRoom);
    }

    @Action
    public deleteRoom(roomToDelete: Room) {
        socket.emit('delete_room', roomToDelete);
    }

    @Action
    public joinRoom(payload: { roomToJoin: Room, participant: Participant }) {
        socket.emit('join_room', payload.roomToJoin, payload.participant);
    }

    @Action
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
