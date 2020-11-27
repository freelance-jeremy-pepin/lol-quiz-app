/* eslint-disable camelcase */
import { Module, Mutation, VuexModule } from 'vuex-module-decorators';

@Module({
    name: 'socket',
})
export default class SocketStore extends VuexModule {
    // region State

    private _isConnected: boolean = false;

    // endregion

    // region Mutations

    @Mutation
    public SOCKET_CONNECT() {
        this._isConnected = true;
    }

    @Mutation
    public SOCKET_DISCONNECT() {
        this._isConnected = false;
    }

    // endregion

    // region Getters

    public get isConnected(): boolean {
        return this._isConnected;
    }

    // endregion
}
