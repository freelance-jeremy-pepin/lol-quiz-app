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

    private _user?: User = undefined;

    // endregion

    // region Mutation

    @Mutation
    public setUser(user: User) {
        this._user = user;
        LocalStorage.set('user', user);
    }

    // endregion

    // region Actions

    @Action({ rawError: true })
    public restoreUser(): Promise<User> {
        return new Promise<User>((resolve) => {
            const userInLocalStorage = LocalStorage.getItem('user');

            if (typeof userInLocalStorage === 'object') {
                const user = userInLocalStorage as User;

                this.setUser(user);
                resolve(user);
            } else {
                resolve(undefined);
            }
        });
    }

    @Action
    public createNewUser(): Promise<User> {
        return new Promise<User>((resolve) => {
            const newUser = {
                id: uniqueID(),
                pseudo: `Guest #${randomNumber(1000, 9999)}`,
            };

            this.setUser(newUser);

            LocalStorage.set('user', newUser);

            resolve(newUser);
        });
    }

    // endregion

    // region Getters

    public get user(): User | undefined {
        return this._user;
    }

    // endregion
}

export default getModule(UserStore);
