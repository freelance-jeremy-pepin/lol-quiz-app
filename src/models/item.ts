export interface Item {
    id: number;
    colloq: string;
    description: string;
    gold: {
        base: number;
        purchasable: boolean;
        sell: number;
        total: number;
    };
    image: {
        full: string;
        group: string;
        h: number;
        sprite: string;
        w: number;
        x: number;
        y: number;
    };
    into: string[];
    maps: boolean[];
    name: string;
    plaintext: string;
    stats: number[];
    tags: string[];
}
