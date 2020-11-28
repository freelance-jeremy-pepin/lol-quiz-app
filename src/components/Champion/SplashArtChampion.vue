<template>
    <canvas
        :id="canvassId"
        :height="717 * ratioImage"
        :width="1215 * ratioImage"
    ></canvas>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { uniqueID } from 'src/utils/number';
import ChampionLolApi from '../../models/LolApi/ChampionLolApi';
import ChampionLolApiRepository from '../../repositories/LolApi/ChampionLolApiRepository';

@Component
export default class SplashArtChampion extends Vue {
    // region Props

    @Prop({ required: true }) champion!: ChampionLolApi;

    @Prop({ required: false, default: 0.7 }) ratioImage!: number;

    @Prop({ required: false, default: 1 }) pixelateValue!: number;

    // endregion

    // region Data

    private canvassId: string = uniqueID();

    private domImg: HTMLCanvasElement | null = null;

    private ctx: CanvasRenderingContext2D | null = null;

    private img: HTMLImageElement | null = null;

    // endregion

    // region Hooks

    // noinspection JSUnusedLocalSymbols
    private mounted() {
        this.domImg = document.getElementById(this.canvassId) as HTMLCanvasElement;

        if (this.domImg) {
            this.ctx = this.domImg.getContext('2d');
            this.img = new Image();
            this.img.onload = this.pixelate;
            this.img.src = new ChampionLolApiRepository().getSplashImageUrl(this.champion);
        }
    }

    // endregion

    // region Methods

    /**
     * stolen from https://jsfiddle.net/fedek6/NgwP2/.
     * @private
     */
    private pixelate() {
        if (this.img && this.ctx && this.domImg) {
            /// calculate the factor
            const fw = ((this.img.width * this.ratioImage) / this.pixelateValue) || 0;
            const fh = ((this.img.height * this.ratioImage) / this.pixelateValue) || 0;

            /// turn off image smoothing (prefixed in some browsers)
            this.ctx.imageSmoothingEnabled = false;

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this.ctx.mozImageSmoothingEnabled = false;

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this.ctx.msImageSmoothingEnabled = false;

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this.ctx.webkitImageSmoothingEnabled = false;

            /// draw mini-version of image
            this.ctx.drawImage(this.img, 0, 0, fw, fh);

            /// draw the mini-version back up, voila, pixelated
            this.ctx.drawImage(this.domImg, 0, 0, fw, fh, 0, 0, this.img.width * this.ratioImage, this.img.height * this.ratioImage);
        }
    }

    // endregion

    // region Methods

    private refreshImage() {
        if (this.img) {
            this.img.src = new ChampionLolApiRepository().getSplashImageUrl(this.champion);
            this.pixelate();
        }
    }

    // endregion

    // region Watchers

    @Watch('champion')
    private onChampionChanged() {
        this.refreshImage();
    }

    @Watch('pixelateValue')
    private onPixelateValueChanged() {
        this.refreshImage();
    }

    // endregion
}
</script>
