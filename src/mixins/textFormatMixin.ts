import { Component, Vue } from 'vue-property-decorator';

// noinspection JSUnusedGlobalSymbols
@Component({
    filters: {
        pluralize(count: number, singular: string, plural: string): string {
            if (count === 0 || count === 1) {
                return singular;
            }

            return plural;
        },

        formatMinutes(minutes: number): string {
            return minutes.toString().padStart(2, '0');
        },

        formatSeconds(seconds: number): string {
            return seconds.toString().padStart(2, '0');
        },

        formatMilliseconds(milliseconds: number): string {
            return milliseconds.toString().padStart(3, '0');
        },
    },
})
export default class TextFormatMixin extends Vue {

}
