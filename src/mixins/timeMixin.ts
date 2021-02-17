import { Component, Vue } from 'vue-property-decorator';
import { Time } from 'src/models/Time';

@Component({
    filters: {
        transformTimeIntoString(time: Time): string {
            return `${time.minutes.toString().padStart(2, '0')}:${time.seconds.toString().padStart(2, '0')}.${time.milliseconds.toString().padStart(3, '0')}`;
        },
    },
})
export default class TimeMixin extends Vue {
}
