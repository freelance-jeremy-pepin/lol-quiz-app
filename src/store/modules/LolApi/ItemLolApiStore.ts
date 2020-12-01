import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from 'src/store';
import ItemLolApi from 'src/models/LolApi/ItemLolApi';
import ItemLolApiRepository from 'src/repositories/LolApi/ItemLolApiRepository';
import { AxiosError } from 'axios';

@Module({
    dynamic: true,
    store,
    name: 'lolApi/items',
    namespaced: true,
})
class ItemLolApiStore extends VuexModule {
    // region State

    private _items: ItemLolApi[] = [];

    // endregion

    // region Mutation

    @Mutation
    public setItems(items: ItemLolApi[]) {
        this._items = items;
    }

    // endregion

    // region Actions

    @Action({ rawError: true })
    public fetchItems(lang = 'en_US'): Promise<ItemLolApi[]> {
        return new Promise((resolve, reject) => {
            new ItemLolApiRepository().getAll(lang)
                .then((items: ItemLolApi[]) => {
                    this.setItems(items);
                    resolve(items);
                })
                .catch((e: AxiosError) => {
                    reject(e);
                });
        });
    }

    // endregion

    // region Getters

    public get items(): ItemLolApi[] {
        return this._items;
    }

    public get itemsFilteredForQuiz(): ItemLolApi[] {
        return this._items.filter(i => {
            // noinspection RedundantIfStatementJS
            if (
                i.maps && i.maps['11'] // Faille de l'invocateur.
                && (i.consumed === undefined || !i.consumed) // Enlève les consommables.
                && (i.requiredChampion === undefined) // Enlève les items nécessitant un champion.
                && (i.inStore === undefined || i.inStore) // Doit être dans le shop.
            ) {
                return true;
            }

            return false;
        });
    }

    public get itemsWithPrice(): ItemLolApi[] {
        return this.itemsFilteredForQuiz.filter(i => i.gold && i.gold.total && i.gold.total > 0);
    }

    // endregion
}

export default getModule(ItemLolApiStore);
