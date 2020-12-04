import { Component, Mixins } from 'vue-property-decorator';
import User from 'src/models/User';
import SocketMixin from 'src/mixins/socketMixin';
import UserStore from 'src/store/modules/UserStore';

@Component
export default class UserMixin extends Mixins(SocketMixin) {
    // region Computed properties

    public get me(): User {
        return UserStore.me;
    }

    public set me(user: User) {
        UserStore.setMe(user);
    }

    // endregion

    // region Methods

    public findUserById(id: string): User | undefined {
        return this.userSocketStore.users.find(u => u.id === id) || undefined;
    }

    public getPseudoById(id: string, replaceWithYou: boolean = false): string {
        if (id) {
            if (replaceWithYou && id === this.me.id) {
                return 'You';
            }

            return this.findUserById(id)?.pseudo || 'Unknown';
        }

        return 'Unknown';
    }

    // endregion
}
