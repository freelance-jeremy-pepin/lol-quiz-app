import { getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from 'src/store';
import RuneLolApi from 'src/models/LolApi/RuneLolApi';

@Module({
    dynamic: true,
    store,
    name: 'quizRune',
    namespaced: true,
})
class QuizRuneStore extends VuexModule {
    // region State

    /**
     * Rune à deviner par le joueur.
     * @public
     */
    public _runeToGuess: RuneLolApi | null = null;

    // endregion

    // region Mutations

    @Mutation
    public setRuneToGuess(runeToGuess: RuneLolApi | null) {
        this._runeToGuess = runeToGuess;
    }

    // endregion

    // region Getters

    public get runeToGuess(): RuneLolApi | null {
        return this._runeToGuess;
    }

    // endregion
}

export default getModule(QuizRuneStore);
