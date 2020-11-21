import { Component, Vue } from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
import SocketStore from 'src/store/modules/Socket/SocketStore';
import UserSocketStore from 'src/store/modules/Socket/UserSocketStore';
import RoomSocketStore from '../store/modules/Socket/RoomSocketStore';

@Component
export default class SocketMixin extends Vue {
    // region Data

    public socketStore: SocketStore = getModule(SocketStore, this.$store);

    public userSocketStore: UserSocketStore = getModule(UserSocketStore, this.$store);

    public roomSocketStore: RoomSocketStore = getModule(RoomSocketStore, this.$store);

    // endregion
}
