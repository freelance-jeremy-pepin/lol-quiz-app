<template>
    <q-img
        :src="imageUrl"
        :style="`width: ${item.image.w}px; height: ${item.image.h};`"
    >
        <q-tooltip v-if="withTooltip" content-class="bg-black" content-style="font-size: 16px;">
            <div class="text-primary text-bold">{{ item.name }}</div>
            <div v-html="item.description"></div>
            <br />
            <div v-if="item.plaintext" class="text-grey text-italic">{{ item.plaintext }}</div>
        </q-tooltip>
    </q-img>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Item } from 'src/models/item';
import ItemRepository from 'src/repositories/itemRepository';

@Component
export default class NameQuiz extends Vue {
    // region Props

    @Prop({ required: true }) item!: Item;

    @Prop({ required: false, default: true, type: Boolean }) withTooltip!: boolean;

    // endregion

    // region Computed properties

    private get imageUrl(): string {
        if (this.item) {
            return new ItemRepository().getImageUrl(this.item.id);
        }

        return '';
    }

    // endregion
}
</script>
