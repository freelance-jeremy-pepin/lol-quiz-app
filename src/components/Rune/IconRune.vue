<template>
    <q-img
        :src="imageUrl"
        :style="`width: 64px; height: 64px;`"
    >
        <q-tooltip v-if="withTooltip" content-class="bg-black" content-style="font-size: 16px;">
            <div v-html="rune.longDesc"></div>
        </q-tooltip>
    </q-img>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import RuneLolApi from 'src/models/LolApi/RuneLolApi';
import RuneLolApiRepository from 'src/repositories/LolApi/RuneLolApiRepository';

@Component
export default class IconRune extends Vue {
    // region Props

    @Prop({ required: true }) rune!: RuneLolApi;

    @Prop({ required: false, default: true, type: Boolean }) withTooltip!: boolean;

    // endregion

    // region Computed properties

    private get imageUrl(): string {
        if (this.rune.icon) {
            return new RuneLolApiRepository().getImageUrl(this.rune.icon);
        }

        return '';
    }

    // endregion
}
</script>
