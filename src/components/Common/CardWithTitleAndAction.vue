<template>
    <q-card
        :align="centerContent ? 'center' : ''"
        :style="`max-width: ${maxWidth}px !important; width: 100% !important;`"
    >
        <q-card-section v-if="title" align="center" class="bg-primary text-white">
            <div class="text-h4">{{ title }}</div>
            <div v-if="subtitle" class="text-h6">{{ subtitle }}</div>
        </q-card-section>

        <slot></slot>

        <q-card-actions v-if="actionLabel" class="q-pa-none">
            <q-btn
                :color="actionColor"
                :disable="actionDisable"
                class="full-width"
                size="lg"
                style="border-top-left-radius: 0; border-top-right-radius: 0;"
                @click="$emit('action')"
            >{{ actionLabel }}
            </q-btn>
        </q-card-actions>
    </q-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class CardWithTitleAndAction extends Vue {
    // region Props

    @Prop({ required: false }) title!: string;

    @Prop({ required: false }) subtitle!: string;

    @Prop({ required: false, default: null }) actionLabel!: string;

    @Prop({ required: false, default: 'accent' }) actionColor!: string;

    @Prop({ required: false, default: true, type: Boolean }) centerContent!: boolean;

    @Prop({ required: false, default: false, type: Boolean }) actionDisable!: boolean;

    @Prop({ required: false, default: 400 }) maxWidth!: number;

    // endregion
}
</script>
