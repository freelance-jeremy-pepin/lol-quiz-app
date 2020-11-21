/* eslint-disable camelcase */
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { socket } from 'boot/socket.io';
import User from 'src/models/User';

@Module({
    name: 'socket/user',
})
export default class UserSocketStore extends VuexModule {
    // region State

    private _users: User[] = [];

    // endregion

    // region Mutations

    @Mutation
    public SOCKET_ALL_USERS(users: User[]) {
        this._users = users;
    }

    @Mutation
    public SOCKET_USER_CREATED_OR_UPDATED(user: User) {
        // Cherche l'utilisateur.
        const indexFound = this._users.findIndex(u => u.id === user.id);

        // Si l'utilisateur existe, le modifie.
        // Sinon l'ajoute.
        if (indexFound > -1) {
            this._users = this._users.map(u => (u.id === user.id ? user : u));
        } else {
            this._users.push(user);
        }
    }

    // endregion

    // region Action

    @Action
    public getAllUsers() {
        socket.emit('get_all_users');
    }

    @Action
    public createOrUpdateUser(user: User) {
        socket.emit('create_or_update_user', user);
    }

    // endregion

    // region Getters

    public get users(): User[] {
        return this._users;
    }

    // endregion
}
