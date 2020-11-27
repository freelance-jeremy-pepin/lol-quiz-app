import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from 'src/store';
import ChampionLolApi from 'src/models/LolApi/ChampionLolApi';
import ChampionLolApiRepository from 'src/repositories/LolApi/ChampionLolApiRepository';
import { AxiosError } from 'axios';

@Module({
    dynamic: true,
    store,
    name: 'lolApi/champions',
    namespaced: true,
})
class ChampionLolApiStore extends VuexModule {
    // region State

    private _champions?: ChampionLolApi[] = undefined;

    // endregion

    // region Mutation

    @Mutation
    public setChampions(champions: ChampionLolApi[]) {
        this._champions = champions;
    }

    // endregion

    // region Actions

    @Action({ rawError: true })
    public fetchChampions(lang = 'en_US'): Promise<ChampionLolApi[]> {
        return new Promise((resolve, reject) => {
            new ChampionLolApiRepository().getAll(lang)
                .then((champions: ChampionLolApi[]) => {
                    this.setChampions(champions);
                    resolve(champions);
                })
                .catch((e: AxiosError) => {
                    reject(e);
                });
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
