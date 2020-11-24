/* eslint-disable camelcase */
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import Room from 'src/models/Room.ts';
import { socket } from 'boot/socket.io';
import Player from 'src/models/Player';
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
    private setRoom(room?: Room | null) {
        this._room = room;
    }

    @Mutation
    public SOCKET_CONNECT() {
        this._rooms = [];

        if (this._room) {
            const roomId = this._room.id;
            this._room = this._rooms.find(r => r.id === roomId);
        }
    }

    @Mutation
    public SOCKET_DISCONNECT() {
        this._rooms = [];

        if (this._room) {
            const roomId = this._room.id;
            this._room = this._rooms.find(r => r.id === roomId);
        }
    }

    @Mutation
    public SOCKET_ALL_ROOMS(rooms: Room[]) {
        this._rooms = rooms;

        if (this._room) {
            const roomId = this._room.id;
            this._room = this._rooms.find(r => r.id === roomId);
        }
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

        if (this._room) {
            const roomId = this._room.id;
            this._room = this._rooms.find(r => r.id === roomId);
        }
    }

    @Mutation
    public SOCKET_ROOM_DELETED(roomDeleted: Room) {
        this._rooms = this._rooms.filter(r => r.id !== roomDeleted.id);

        if (this._room) {
            const roomId = this._room.id;
            this._room = this._rooms.find(r => r.id === roomId);
        }
    }

    @Mutation
    public SOCKET_ROOM_JOINED(payload: { roomJoined: Room, player: Player }) {
        this._rooms = this._rooms.map(r => {
            if (r.id === payload.roomJoined.id) {
                r.players.push(payload.player);
            }

            return r;
        });

        if (this._room) {
            const roomId = this._room.id;
            this._room = this._rooms.find(r => r.id === roomId);
        }
    }

    @Mutation
    public SOCKET_ROOM_LEFT(payload: { roomLeft: Room, player: Player }) {
        this._rooms = this._rooms.map(r => {
            if (r.id === payload.roomLeft.id) {
                r.players = r.players.filter(p => p.id !== payload.player.id);
            }

            return r;
        });

        if (this._room) {
            const roomId = this._room.id;
            this._room = this._rooms.find(r => r.id === roomId);
        }
    }

    @Mutation
    public SOCKET_PLAYER_UPDATED(payload: { room: Room, playerUpdated: Player }) {
        this._rooms = this._rooms.map(r => {
            if (r.id === payload.room.id) {
                r.players = r.players.map(p => (p.id === payload.playerUpdated.id ? payload.playerUpdated : p));
            }

            return r;
        });

        if (this._room && this._room.id === payload.room.id) {
            this._room.players = this._room.players.map(p => (p.id === payload.playerUpdated.id ? payload.playerUpdated : p));
        }
    }

    // endregion

    // region Action

    @Action({ rawError: true })
    public getAllRooms() {
        socket.emit('get_all_rooms');
    }

    @Action({ rawError: true })
    public getRoomById(payload: { id: string, user: User }) {
        this.setRoom(undefined);
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
    public joinRoom(payload: { roomToJoin: Room, player: Player }) {
        socket.emit('join_room', payload.roomToJoin, payload.player);
    }

    @Action({ rawError: true })
    public leaveRoom(payload: { roomToLeave: Room, player: Player }) {
        socket.emit('leave_room', payload.roomToLeave, payload.player);
    }

    @Action({ rawError: true })
    public updatePlayer(payload: { room: Room, player: Player }) {
        socket.emit('update_player', payload.room, payload.player);
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
