import axios, { AxiosResponse } from 'axios';
import RuneLolApi from 'src/models/LolApi/RuneLolApi';
import LoLApiVersionModule from '../../store/modules/LolApi/VersionLolApiStore';
import LolApiRepository from './LolApiRepository';

export default class RuneLolApiRepository extends LolApiRepository {
    public getAll(lang = 'en_US'): Promise<RuneLolApi[]> {
        return new Promise((resolve, reject) => {
            axios.get(`${this.baseUrl}/data/${lang}/runesReforged.json`)
                .then((response: AxiosResponse) => {
                    let runes: RuneLolApi[] = [];

                    response.data.forEach((d: any) => {
                        d.slots.forEach((slot: any) => {
                            runes = [...runes, ...slot.runes] as RuneLolApi[];
                        });
                    });
                    resolve(runes);
                })
                .catch((e) => {
                    reject('Unable to fetch runes.');
                    throw new Error(e);
                });
        });
    }

    public getImageUrl(icon: string) {
        if (LoLApiVersionModule.version) {
            return `${this.baseUrlWithoutVersion}/img/${icon}`;
        }

        return '';
    }
}
