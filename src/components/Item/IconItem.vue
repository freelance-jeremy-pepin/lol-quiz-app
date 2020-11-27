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
import ItemLolApi from 'src/models/LolApi/ItemLolApi';
import ItemLolApiRepository from 'src/repositories/LolApi/ItemLolApiRepository';

@Component
export default class IconItem extends Vue {
    // region Props

    @Prop({ required: true }) item!: ItemLolApi;

    @Prop({ required: false, default: true, type: Boolean }) withTooltip!: boolean;

    // endregion

    // region Computed properties

    private get imageUrl(): string {
        if (this.item.id) {
            return new ItemLolApiRepository().getImageUrl(this.item.id);
        }

        return '';
    }

    // endregion
}
</script>
