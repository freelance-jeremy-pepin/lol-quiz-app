import { Component, Mixins } from 'vue-property-decorator';
import User from 'src/models/User';
import SocketMixin from 'src/mixins/socketMixin';
import UserStore from 'src/store/modules/UserStore';

@Component
export default class UserMixin extends Mixins(SocketMixin) {
    // region Computed properties

    public get me(): User | undefined {
        return UserStore.me;
    }

    public set me(user: User | undefined) {
        UserStore.setMe(user);
    }

    // endregion

    // region Methods

    public findUserById(id: string): User | undefined {
        return this.userSocketStore.users.find(u => u.id === id) || undefined;
    }

    public getPseudoById(id: string | undefined): string {
        if (id) {
            return this.findUserById(id)?.pseudo || 'Unknown';
        }

        return 'Unknown';
    }

    // endregion
}
