import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from 'src/store';
import ItemLolApi from 'src/models/LolApi/ItemLolApi';
import ItemRepository from 'src/repositories/itemRepository';

@Module({
    dynamic: true,
    store,
    name: 'lolApi/items',
    namespaced: true,
})
class ItemLolApiStore extends VuexModule {
    // region State

    private _items?: ItemLolApi[] = undefined;

    // endregion

    // region Mutation

    @Mutation
    public setItems(items: ItemLolApi[]) {
        this._items = items;
    }

    // endregion

    // region Actions

    @Action
    public fetchItems(lang = 'en_US') {
        new ItemRepository().getAll(lang)
            .then((items: ItemLolApi[]) => {
                this.setItems(items);
            })
            .catch(() => {
                throw new Error('Unable to fetch items');
            });
    }

    // endregion

    // region Getters

    public get items(): ItemLolApi[] | undefined {
        return this._items;
    }

    public get itemsFilteredForQuiz(): ItemLolApi[] | undefined {
        if (this._items) {
            return this._items.filter(i => {
                if (
                    i.maps && i.maps['11']
                    && (i.consumed === undefined || !i.consumed) // Enlève les consommables.
                    && (i.requiredChampion === undefined) // Enlève les items nécessitant un champion.
                ) {
                    return true;
                }

                return false;
            });
        }

        return undefined;
    }

    // endregion
}

export default getModule(ItemLolApiStore);
