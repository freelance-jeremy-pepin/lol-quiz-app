import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from 'src/store';
import User from 'src/models/User';
import { randomNumber, uniqueID } from 'src/utils/randomNumber';
import { LocalStorage } from 'quasar';

@Module({
    dynamic: true,
    store,
    name: 'user',
    namespaced: true,
})
class UserStore extends VuexModule {
    // region State

    private _me?: User = undefined;

    // endregion

    // region Mutation

    @Mutation
    public setMe(user: User) {
        this._me = user;
        LocalStorage.set('user', user);
    }

    // endregion

    // region Actions

    @Action({ rawError: true })
    public restoreMe(): Promise<User> {
        return new Promise<User>((resolve) => {
            const userInLocalStorage = LocalStorage.getItem('user');

            if (typeof userInLocalStorage === 'object') {
                const user = userInLocalStorage as User;

                this.setMe(user);
                resolve(user);
            } else {
                resolve(undefined);
            }
        });
    }

    @Action
    public createNewGuest(): Promise<User> {
        return new Promise<User>((resolve) => {
            const newUser = {
                id: uniqueID(),
                pseudo: `Guest #${randomNumber(1000, 9999)}`,
            };

            this.setMe(newUser);

            LocalStorage.set('user', newUser);

            resolve(newUser);
        });
    }

    // endregion

    // region Getters

    public get me(): User | undefined {
        return this._me;
    }

    // endregion
}

export default getModule(UserStore);
