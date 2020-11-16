import { Item } from 'src/models/item';
import axios, { AxiosResponse } from 'axios';
import LoLApiVersionModule from '../store/modules/lol-api/lol-api-version-module';

export default class ItemRepository {
    private baseUrl: string = LoLApiVersionModule.version ? `http://ddragon.leagueoflegends.com/cdn/${LoLApiVersionModule.version}` : '';

    public getAll(lang = 'en_US'): Promise<Item[]> {
        return new Promise((resolve, reject) => {
            axios.get(`${this.baseUrl}/data/${lang}/item.json`)
                .then((response: AxiosResponse) => {
                    // eslint-disable-next-line @typescript-eslint/ban-types,@typescript-eslint/no-unsafe-assignment
                    const items: Object = response.data.data;
                    const itemsFormatted = [];

                    // eslint-disable-next-line no-restricted-syntax
                    for (const [key, value] of Object.entries(items)) {
                        value.id = parseInt(key, 10);
                        itemsFormatted.push(value);
                    }

                    resolve(itemsFormatted);
                })
                .catch(() => {
                    reject('Unable to fetch items.');
                });
        });
    }

    public getImageUrl(itemId: number) {
        if (LoLApiVersionModule.version) {
            return `${this.baseUrl}/img/item/${itemId.toString()}.png`;
        }

        return '';
    }
}
