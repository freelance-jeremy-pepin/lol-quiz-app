import { Component, Mixins } from 'vue-property-decorator';
import SocketMixin from 'src/mixins/socketMixin';

@Component({
    filters: {
        formatIsReadyLabel(isReady: boolean): string {
            return isReady ? `Ready` : `Not ready`;
        },

        formatIsReadyColor(isReady: boolean): string {
            return isReady ? `positive` : `negative`;
        },
    },
})
export default class ParticipantMixin extends Mixins(SocketMixin) {
}
