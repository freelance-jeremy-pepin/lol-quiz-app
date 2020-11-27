import { Component, Vue } from 'vue-property-decorator';

@Component({
    filters: {
        pluralize(count: number, singular: string, plural: string): string {
            if (count === 0 || count === 1) {
                return singular;
            }

            return plural;
        },
    },
})
export default class TextFormatMixin extends Vue {

}
