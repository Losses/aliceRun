const ALL_SOUNDS = [
    'glass-click.m4a',
    'glass-clcik2.m4a',
    'glass-enter.m4a',
    'slide-down.m4a',
    'slide-up.m4a',
] as const;

export const AudioManager = async () => {
    const context = new AudioContext();

    const sounds = {} as Record<typeof ALL_SOUNDS[number], AudioBuffer | undefined>;

    ALL_SOUNDS.forEach(async (x) => {
        const res = await fetch(`/sfx/${x}`);
        const buffer = await res.arrayBuffer();
        sounds[x] = await context.decodeAudioData(buffer);
    });

    const playSound = (id: typeof ALL_SOUNDS[number]) => {
        const audioBuffer = sounds[id];

        if (!audioBuffer) return;

        const source = context.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(context.destination);

        source.start();
    }

    document.querySelectorAll('.glass').forEach(($) => {
        $.addEventListener('click', () => { {
            playSound(($ as HTMLElement).dataset.clickSound as typeof ALL_SOUNDS[number] ?? 'glass-click2.m4a');
        }});
        $.addEventListener('mouseenter', () => {
            playSound('glass-enter.m4a');
        });
    });

    document.querySelectorAll('.glass-slide').forEach(($) => {
        $.addEventListener('mousedown', (event) => {
            playSound('slide-down.m4a');
        });
        $.addEventListener('mouseup', (event) => {
            playSound('slide-up.m4a');
        });
    });
};