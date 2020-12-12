import axios, { AxiosResponse } from 'axios';
import ChampionLolApi, { ImageTypesChampionLolApi } from '../../models/LolApi/ChampionLolApi';
import LolApiRepository from './LolApiRepository';

export default class ChampionLolApiRepository extends LolApiRepository {
    public getAll(lang = 'en_US'): Promise<ChampionLolApi[]> {
        return new Promise((resolve, reject) => {
            axios.get(`${this.baseUrl}/data/${lang}/champion.json`)
                .then((response: AxiosResponse) => {
                    // eslint-disable-next-line @typescript-eslint/ban-types,@typescript-eslint/no-unsafe-assignment
                    const champions: Object = response.data.data;
                    const championsFormatted: ChampionLolApi[] = [];
                    const promises: Promise<void>[] = [];

                    // eslint-disable-next-line no-restricted-syntax
                    for (const [id] of Object.entries(champions)) {
                        promises.push(
                            this.getById(id).then(c => {
                                championsFormatted.push(c);
                            }),
                        );
                    }

                    Promise.all(promises).then(() => {
                        resolve(championsFormatted);
                    });
                })
                .catch(() => {
                    reject('Unable to fetch champions.');
                });
        });
    }

    public getById(id: string, lang = 'en_US'): Promise<ChampionLolApi> {
        return new Promise((resolve, reject) => {
            axios.get(`${this.baseUrl}/data/${lang}/champion/${id}.json`)
                .then((response: AxiosResponse) => {
                    const champion: ChampionLolApi = Object.values(response.data.data)[0] as ChampionLolApi;
                    resolve(champion);
                })
                .catch(() => {
                    reject('Unable to fetch champions.');
                });
        });
    }

    public getSplashImageUrl(champion: ChampionLolApi, skinNum: number = 0) {
        return this.getImageUrl(champion, skinNum, ImageTypesChampionLolApi.splash);
    }

    public getLoadingImageUrl(champion: ChampionLolApi, skinNum: number = 0) {
        return this.getImageUrl(champion, skinNum, ImageTypesChampionLolApi.loading);
    }

    public getPortraitImageUrl(champion: ChampionLolApi) {
        return this.getImageUrl(champion, 0, ImageTypesChampionLolApi.portrait);
    }

    public getPassiveImageUrl(spellImageFull: string) {
        return `${this.baseUrl}/img/passive/${spellImageFull}`;
    }

    public getSpellImageUrl(spellImageFull: string) {
        return `${this.baseUrl}/img/spell/${spellImageFull}`;
    }

    // noinspection JSUnusedGlobalSymbols
    public getSquareImageUrl(champion: ChampionLolApi) {
        if (champion.image?.full) {
            return `${this.baseUrlWithoutVersion}/img/champion/${champion.image.full}.png`;
        }

        return '';
    }

    private getImageUrl(champion: ChampionLolApi, skinNum: number, imgType: ImageTypesChampionLolApi) {
        if (champion.image?.full) {
            const championNameWithExtension = champion.image.full;
            const championName = championNameWithExtension.split('.')[0];
            let extension = championNameWithExtension.split('.')[1];

            switch (imgType) {
                case ImageTypesChampionLolApi.loading:
                case ImageTypesChampionLolApi.splash:
                    extension = 'jpg';

                    return `${this.baseUrlWithoutVersion}/img/champion/${imgType}/${championName}_${skinNum}.${extension}`;

                case ImageTypesChampionLolApi.portrait:
                    return `${this.baseUrl}/img/champion/${championNameWithExtension}`;

                default:
                    return '';
            }
        }

        return '';
    }
}
