const LOW_FREQ = 0.5;
const HIGH_FREQ = 10;

const FREQ_LIST = [] as number[];

for (let i = LOW_FREQ; i <= HIGH_FREQ; i += 0.2) {
    FREQ_LIST.push(i);
}

export const convolutionSin = (signal: number[], freq: number) => {
    return signal.map((v, i) => {
        const x = i / signal.length;
        return v * Math.sin(2 * Math.PI * freq * x);
    });
};

