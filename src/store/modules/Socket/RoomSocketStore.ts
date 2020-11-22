/* eslint-disable camelcase */
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import Room from 'src/models/Room.ts';
import { socket } from 'boot/socket.io';
import Participant from 'src/models/Participant';
import User from 'src/models/User';

@Module({
    name: 'socket/room',
})
export default class RoomSocketStore extends VuexModule {
    // region State

    private _rooms: Room[] = [];

    private _room?: Room | null = undefined;

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
    public SOCKET_ROOM_BY_ID(room: Room | null) {
        this._room = room;
    }

    @Mutation
    public SOCKET_ROOM_CREATED_OR_UPDATED(room: Room) {
        // Cherche la salle.
        const indexFound = this._rooms.findIndex(r => r.id === room.id);

        // Si la salle existe, la modifie.
        // Sinon l'ajoute.
        if (indexFound > -1) {
            this._rooms = this._rooms.map(r => (r.id === room.id ? room : r));
        } else {
            this._rooms.push(room);
        }
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

    @Mutation
    public SOCKET_PARTICIPANT_UPDATED(payload: { room: Room, participantUpdated: Participant }) {
        this._rooms = this._rooms.map(r => {
            if (r.id === payload.room.id) {
                r.participants = r.participants.map(p => (p.id === payload.participantUpdated.id ? payload.participantUpdated : p));
            }

            return r;
        });
    }

    // endregion

    // region Action

    @Action({ rawError: true })
    public getAllRooms() {
        this._room = undefined;
        socket.emit('get_all_rooms');
    }

    @Action({ rawError: true })
    public getRoomById(payload: { id: string, user: User }) {
        socket.emit('get_room_by_id', payload.id, payload.user);
    }

    @Action({ rawError: true })
    public createOrUpdateRoom(room: Room) {
        socket.emit('create_or_update_room', room);
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

    @Action({ rawError: true })
    public updateParticipant(payload: { room: Room, participant: Participant }) {
        socket.emit('update_participant', payload.room, payload.participant);
    }

    // endregion

    // region Getters

    public get rooms(): Room[] {
        return this._rooms;
    }

    public get roomsNotInGame(): Room[] {
        return this._rooms.filter(r => !r.inGame);
    }

    public get room(): Room | undefined | null {
        return this._room;
    }

    // endregion
}
