import { getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from 'src/store';
import ItemLolApi from 'src/models/LolApi/ItemLolApi';

@Module({
    dynamic: true,
    store,
    name: 'quizItem',
    namespaced: true,
})
class QuizItemStore extends VuexModule {
    // region State

    /**
     * Objet à deviner par le joueur.
     * @public
     */
    public _itemToGuess: ItemLolApi | null = null;

    // endregion

    // region Mutations

    @Mutation
    public setItemToGuess(itemToGuess: ItemLolApi | null) {
        this._itemToGuess = itemToGuess;
    }

    // endregion

    // region Getters

    public get itemToGuess(): ItemLolApi | null {
        return this._itemToGuess;
    }

    // endregion
}

export default getModule(QuizItemStore);
