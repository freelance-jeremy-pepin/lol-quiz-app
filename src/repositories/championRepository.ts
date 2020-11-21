import ItemLolApi from 'src/models/LolApi/ItemLolApi';
import axios, { AxiosResponse } from 'axios';
import ChampionLolApi from '../models/LolApi/ChampionLolApi';
import LoLApiVersionModule from '../store/modules/LolApi/VersionLolApiStore';
import LolApiRepositoryBase from './lolApiRepositoryBase';

export default class ChampionRepository extends LolApiRepositoryBase {
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

    public getSplashImageUrl(championName: string, skinNum: number = 0) {
        return this.getImageUrl(championName, skinNum, 'splash');
    }

    public getLoadingImageUrl(championName: string, skinNum: number = 0) {
        return this.getImageUrl(championName, skinNum, 'loading');
    }

    public getSquareImageUrl(championName: string) {
        if (LoLApiVersionModule.version) {
            championName = championName.toLowerCase().charAt(0).toUpperCase();

            return `${this.baseUrl}/img/champion/${championName}.png`;
        }

        return '';
    }

    private getImageUrl(championName: string, skinNum: number, imgType: string) {
        if (LoLApiVersionModule.version) {
            championName = championName.toLowerCase().charAt(0).toUpperCase();

            return `${this.baseUrl}/img/champion/${imgType}/${championName}_${skinNum}.jpg`;
        }

        return '';
    }
}
