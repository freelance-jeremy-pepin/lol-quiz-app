import axios, { AxiosResponse } from 'axios';
import ChampionLolApi from '../../models/LolApi/ChampionLolApi';
import LolApiRepository from './LolApiRepository';

export default class ChampionLolApiRepository extends LolApiRepository {
    public getAll(lang = 'en_US'): Promise<ChampionLolApi[]> {
        return new Promise((resolve, reject) => {
            axios.get(`${this.baseUrl}/data/${lang}/champion.json`)
                .then((response: AxiosResponse) => {
                    // eslint-disable-next-line @typescript-eslint/ban-types,@typescript-eslint/no-unsafe-assignment
                    const champions: Object = response.data.data;
                    const championsFormatted = [];

                    // eslint-disable-next-line no-restricted-syntax
                    for (const [key, value] of Object.entries(champions)) {
                        value.id = parseInt(key, 10);
                        championsFormatted.push(value);
                    }

                    resolve(championsFormatted);
                })
                .catch(() => {
                    reject('Unable to fetch champions.');
                });
        });
    }

    public getSplashImageUrl(champion: ChampionLolApi, skinNum: number = 0) {
        return this.getImageUrl(champion, skinNum, 'splash');
    }

    public getLoadingImageUrl(champion: ChampionLolApi, skinNum: number = 0) {
        return this.getImageUrl(champion, skinNum, 'loading');
    }

    public getSquareImageUrl(champion: ChampionLolApi) {
        if (champion.image?.full) {
            return `${this.baseUrlWithoutVersion}/img/champion/${champion.image.full}.png`;
        }

        return '';
    }

    private getImageUrl(champion: ChampionLolApi, skinNum: number, imgType: string) {
        if (champion.image?.full) {
            const championName = champion.image.full.split('.')[0];
            const extension = 'jpg';

            return `${this.baseUrlWithoutVersion}/img/champion/${imgType}/${championName}_${skinNum}.${extension}`;
        }

        return '';
    }
}
