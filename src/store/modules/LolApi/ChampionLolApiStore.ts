import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from 'src/store';
import ChampionLolApi from 'src/models/LolApi/ChampionLolApi';
import ChampionRepository from 'src/repositories/championRepository';

@Module({
    dynamic: true,
    store,
    name: 'lolApi/champions',
    namespaced: true
})
class ChampionLolApiStore extends VuexModule {
    // region State

    private _champions?: ChampionLolApi[] = undefined;

    // endregion

    // region Mutation

    @Mutation
    public setChampions(items: ChampionLolApi[]) {
        this._champions = items;
    }

    // endregion

    // region Actions

    @Action
    public fetchChampions(lang = 'en_US') {
        new ChampionRepository().getAll(lang)
        .then((items: ChampionLolApi[]) => {
            this.setChampions(items);
        })
        .catch(() => {
            throw new Error('Unable to fetch items');
        });
    }

    // endregion

    // region Getters

    public get champions(): ChampionLolApi[] | undefined {
        return this._champions;
    }

    // endregion
}

export default getModule(ChampionLolApiStore);
