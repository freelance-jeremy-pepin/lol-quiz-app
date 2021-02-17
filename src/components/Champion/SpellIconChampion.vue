<template>
    <q-img
        :src="imageUrl"
        :style="`width: ${championSpell.image.w}px; height: ${championSpell.image.h};`"
    >
        <q-tooltip v-if="withTooltip" content-class="bg-black" content-style="font-size: 16px;">
            <div class="text-primary text-bold">{{ championSpell.abilityKey }} - {{ championSpell.name }}</div>
            <div v-html="championSpell.description"></div>
        </q-tooltip>
    </q-img>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import ChampionSpellLolApi from 'src/models/LolApi/ChampionSpellLolApi';
import ChampionLolApiRepository from 'src/repositories/LolApi/ChampionLolApiRepository';

@Component
export default class IconItem extends Vue {
    // region Props

    @Prop({ required: true }) championSpell!: ChampionSpellLolApi;

    @Prop({ required: false, default: false, type: Boolean }) withTooltip!: boolean;

    // endregion

    // region Computed properties

    private get imageUrl(): string {
        if (this.championSpell.isPassive) {
            return new ChampionLolApiRepository().getPassiveImageUrl(this.championSpell.image.full);
        }

        return new ChampionLolApiRepository().getSpellImageUrl(this.championSpell.image.full);
    }

    // endregion
}
</script>
