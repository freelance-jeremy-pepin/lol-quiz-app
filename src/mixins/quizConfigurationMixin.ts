import { Component, Vue } from 'vue-property-decorator';

@Component({
    filters: {
        formatWithStopWatch(value: boolean): string {
            return value ? `With stop watch` : `Without stop watch`;
        },
    },
})
export default class QuizConfigurationMixin extends Vue {
}
