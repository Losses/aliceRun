import { AudioContext } from "standardized-audio-context";
<<<<<<< HEAD
=======
import { createEventName } from "@web-media/event-target";
import { Clip, Mp3DeMuxAdapter } from "@web-media/phonograph"; 
import { eventTarget } from "./EventManager";
>>>>>>> 89a0f650196a25caefaeed7dddfe305b8d55ae4f

const ALL_SOUNDS = [
    'glass-click.m4a',
    'glass-clcik2.m4a',
    'glass-enter.m4a',
    'slide-down.m4a',
    'slide-up.m4a',
    'checkbox-on.m4a',
    'checkbox-off.m4a',
] as const;

<<<<<<< HEAD
export const globalAudioContext = new AudioContext();
=======
export const PLAY_ADVANCED_SOUND = createEventName<string>();
>>>>>>> 89a0f650196a25caefaeed7dddfe305b8d55ae4f

export const AudioManager = async () => {

    const sounds = {} as Record<typeof ALL_SOUNDS[number], AudioBuffer | undefined>;

    eventTarget.addEventListener(PLAY_ADVANCED_SOUND, async ({detail}) => {
        const clip = new Clip({
            url: detail,
            adapter: new Mp3DeMuxAdapter(),
            context,
        });

        await clip.buffer();
        clip.play();
    });

    ALL_SOUNDS.forEach(async (x) => {
        const res = await fetch(`/sfx/${x}`);
        const buffer = await res.arrayBuffer();
        sounds[x] = await globalAudioContext.decodeAudioData(buffer);
    });

    const playSound = (id: typeof ALL_SOUNDS[number]) => {
        const audioBuffer = sounds[id];

        if (!audioBuffer) return;

        const source = globalAudioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(globalAudioContext.destination);

        source.start();
    }

    document.querySelectorAll('.glass').forEach(($) => {
        $.addEventListener('click', () => {
            {
                playSound(($ as HTMLElement).dataset.clickSound as typeof ALL_SOUNDS[number] ?? 'glass-click2.m4a');
            }
        });
        $.addEventListener('mouseenter', () => {
            playSound('glass-enter.m4a');
        });
    });

    document.querySelectorAll('.glass-slide').forEach(($) => {
        $.addEventListener('mousedown', () => {
            playSound('slide-down.m4a');
        });
        $.addEventListener('mouseup', () => {
            playSound('slide-up.m4a');
        });
    });

    document.querySelectorAll('.glass-checkbox input').forEach(($) => {
        $.addEventListener('change', (event) => {
            const target = event.target as HTMLInputElement;

            if (target.checked) {
                playSound('checkbox-on.m4a');
            } else {
                playSound('checkbox-off.m4a');
            }
        });
    });
};