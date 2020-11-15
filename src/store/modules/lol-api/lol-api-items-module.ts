import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from 'src/store';
import axios, { AxiosResponse } from 'axios';
import { Item } from 'src/models/item';
import ItemRepository from 'src/repositories/itemRepository';

@Module({
    dynamic: true,
    store,
    name: 'lol-api/items',
    namespaced: true,
})
class LolApiItemsModule extends VuexModule {
    // region State

    private _items?: Item[] = undefined;

    // endregion

    // region Mutation

    @Mutation
    public setItems(items: Item[]) {
        this._items = items;
    }

    // endregion

    // region Actions

    @Action
    public fetchItems(lang = 'en_US') {
        new ItemRepository().getAll(lang)
            .then((items) => {
                this.setItems(items);
            })
            .catch(() => {
                throw new Error('Unable to fetch items');
            });
    }

    // endregion

    // region Getters

    public get items(): Item[] | undefined {
        return this._items;
    }

    // endregion
}

export default getModule(LolApiItemsModule);
