import { Stats } from 'src/models/stats';
import { Maps } from 'src/models/maps';

export interface Item {
    id: number;
    name: string;
    rune: {
        isrune: boolean;
        tier: number;
        type: string;
    };
    gold: {
        base: number;
        purchasable: boolean;
        sell: number;
        total: number;
    };
    group: string;
    description: string;
    colloq: string;
    plaintext: string;
    consumed: boolean;
    stacks: number;
    depth: number;
    consumeOnFull: boolean;
    from: string[];
    into: string[];
    specialRecipe: number;
    inStore: boolean;
    hideFromAll: boolean;
    requiredChampion: string;
    requiredAlly: string;
    stats: Stats;
    tags: string[];
    maps: Maps;
    image: {
        full: string;
        group: string;
        h: number;
        sprite: string;
        w: number;
        x: number;
        y: number;
    };
}
