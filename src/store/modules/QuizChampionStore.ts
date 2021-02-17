import { getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from 'src/store';
import ChampionLolApi from 'src/models/LolApi/ChampionLolApi';

@Module({
    dynamic: true,
    store,
    name: 'quizChampion',
    namespaced: true,
})
class QuizChampionStore extends VuexModule {
    // region State

    /**
     * Champion à deviner par le joueur.
     * @public
     */
    public _championToGuess: ChampionLolApi | null = null;

    // endregion

    // region Mutations

    @Mutation
    public setChampionToGuess(championToGuess: ChampionLolApi | null) {
        this._championToGuess = championToGuess;
    }

    // endregion

    // region Getters

    public get championToGuess(): ChampionLolApi | null {
        return this._championToGuess;
    }

    // endregion
}

export default getModule(QuizChampionStore);
