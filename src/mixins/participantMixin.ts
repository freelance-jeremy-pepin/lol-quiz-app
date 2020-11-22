import { Component, Vue } from 'vue-property-decorator';

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
export default class ParticipantMixin extends Vue {
}
