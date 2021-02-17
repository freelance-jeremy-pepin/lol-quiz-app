<template>
    <div>
        <span v-for="item in items" :key="item.id" @click="onItemClick(item)">
            <icon-item :item="item" class="q-ma-xs"></icon-item>
        </span>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ItemLolApi from 'src/models/LolApi/ItemLolApi';
import ItemLolApiStore from 'src/store/modules/LolApi/ItemLolApiStore';
import IconItem from 'components/Item/IconItem.vue';

@Component({
    components: { IconItem },
})
export default class ItemsCollectionPage extends Vue {
    // region Computed properties

    private get items(): ItemLolApi[] {
        return ItemLolApiStore.itemsFilteredForQuiz;
    }

    // endregion

    // region Events handlers

    private onItemClick(item: ItemLolApi) {
        // eslint-disable-next-line no-console
        console.log(item);
    }

    // endregion
}
</script>
