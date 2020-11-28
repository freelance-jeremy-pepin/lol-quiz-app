import { uniqueID } from 'src/utils/number';
import Model from 'src/models/Model';

export interface Time extends Model {
    minutes: number;
    seconds: number;
    milliseconds: number;
    totalSeconds: number;
}

export function createDefaultTime(): Time {
    return {
        id: uniqueID(),
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
        totalSeconds: 0,
    };
}

export function createNewTime(timeElapsed: number): Time {
    const milliseconds = timeElapsed % 1000;
    timeElapsed = (timeElapsed - milliseconds) / 1000;
    const seconds = timeElapsed % 60;
    timeElapsed = (timeElapsed - seconds) / 60;
    const minutes = timeElapsed % 60;

    return {
        id: uniqueID(),
        minutes,
        seconds,
        milliseconds,
        totalSeconds: minutes * 60 + seconds,
    };
}
