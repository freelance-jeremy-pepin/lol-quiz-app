import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from 'src/store';
import axios, { AxiosResponse } from 'axios';

@Module({
    dynamic: true,
    store,
    name: 'lol-api/version',
    namespaced: true,
})
class LolApiVersionModule extends VuexModule {
    // region State

    private _version?: string = undefined;

    // endregion

    // region Mutation

    @Mutation
    public setVersion(version: string) {
        this._version = version;
    }

    // endregion

    // region Actions

    @Action
    public fetchVersion(): Promise<string> {
        return new Promise((resolve, reject) => {
            axios.get('https://ddragon.leagueoflegends.com/api/versions.json')
                .then((response: AxiosResponse) => {
                    const version = response.data[0];
                    this.setVersion(version);
                    resolve(version);
                })
                .catch(() => {
                    reject('Unable to fetch version.');
                });
        });
    }

    // endregion

    // region Getters

    public get version(): string | undefined {
        return this._version;
    }

    // endregion
}

export default getModule(LolApiVersionModule);
