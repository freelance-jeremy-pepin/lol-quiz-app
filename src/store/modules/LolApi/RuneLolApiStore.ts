import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from 'src/store';
import { AxiosError } from 'axios';
import RuneLolApi from 'src/models/LolApi/RuneLolApi';
import RuneLolApiRepository from 'src/repositories/LolApi/RuneLolApiRepository';

@Module({
    dynamic: true,
    store,
    name: 'lolApi/runes',
    namespaced: true,
})
class RuneLolApiStore extends VuexModule {
    // region State

    private _runes: RuneLolApi[] = [];

    // endregion

    // region Mutation

    @Mutation
    public setRunes(runes: RuneLolApi[]) {
        this._runes = runes;
    }

    // endregion

    // region Actions

    @Action({ rawError: true })
    public fetchRunes(lang = 'en_US'): Promise<RuneLolApi[]> {
        return new Promise((resolve, reject) => {
            new RuneLolApiRepository().getAll(lang)
                .then((runes: RuneLolApi[]) => {
                    this.setRunes(runes);
                    resolve(runes);
                })
                .catch((e: AxiosError) => {
                    reject(e);
                });
        });
    }

    // endregion

    // region Getters

    public get runes(): RuneLolApi[] {
        return this._runes;
    }

    // endregion
}

export default getModule(RuneLolApiStore);
