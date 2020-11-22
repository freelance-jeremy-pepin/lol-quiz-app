import { Component, Mixins } from 'vue-property-decorator';
import SocketMixin from 'src/mixins/socketMixin';

@Component({
    filters: {
        formatWithStopWatch(value: boolean): string {
            return value ? `With stop watch` : `Without stop watch`;
        },
    },
})
export default class QuizConfigurationMixin extends Mixins(SocketMixin) {
}
