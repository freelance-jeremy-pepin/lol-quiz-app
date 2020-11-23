import { getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from 'src/store';
import Player, { createDefaultPlayer } from 'src/models/Player';

@Module({
    dynamic: true,
    store,
    name: 'quiz',
    namespaced: true,
})
class QuizStore extends VuexModule {
    // region State

    private _player: Player = createDefaultPlayer();

    // endregion

    // region Mutations

    @Mutation
    public setPlayer(player: Player) {
        this._player = player;
    }

    // endregion

    // region Getters

    public get player(): Player {
        return this._player;
    }

    // endregion
}

export default getModule(QuizStore);
