import { Clip, Mp3DeMuxAdapter } from '@web-media/phonograph';

import { THEME_ID } from './ColorManager';

import { stories } from '../stories';
import { LOW_LIMIT } from '../stores/runStat';
import { DIFFICULTY } from '../stores/settings';
import { FrameRateLevel } from '../utils/TimeMagic';
import { globalAudioContext } from '../manager/AudioManager';
import type { IPlayAudioStoryEvent } from '../stories/utils';
import { QUERY_PARAMETER, ROUTER_ID, isSingle, isStory } from '../stores/router';
import { type ITimelineEvent, TimelineManager } from '../utils/TimeLine';

import { timeManager } from './TimeManager';

export const STORY_AUDIO_URL_BASE = 'https://resource.alice.is.not.ci/';

export const timeLine = new TimelineManager(
   stories,
   {
      audio: (x: ITimelineEvent<'audio', IPlayAudioStoryEvent>) => {
         const clip = new Clip({
            context: globalAudioContext,
            url: STORY_AUDIO_URL_BASE + x.detail.url,
            adapter: new Mp3DeMuxAdapter(),
         });

         const id = x.detail.url;

         performance.mark(`advancedAudio-${id}:load:start`);
         clip.buffer().then(async () => {
            performance.mark(`advancedAudio-${id}:play:start`);
            clip.play().then((x) => {
               performance.mark(`advancedAudio-${id}:play:end`);
               performance.measure(
                  `advancedAudio-${id}:play`,
                  `advancedAudio-${id}:play:start`,
                  `advancedAudio-${id}:play:end`,
               );
            });
         });
         performance.mark(`advancedAudio-${id}:load:end`);
         performance.measure(
            `advancedAudio-${id}:load`,
            `advancedAudio-${id}:load:start`,
            `advancedAudio-${id}:load:end`,
         );

         return () => {
            clip.dispose();
         };
      },
      end: (x: ITimelineEvent<'end', null>) => {
         const $finishTraining = document.querySelector('.finish-training') as HTMLDivElement | null;
         if ($finishTraining) {
            $finishTraining.click();
         }
      },
      theme: (x: ITimelineEvent<'theme', string>) => {
         THEME_ID.value = x.detail;
      },
      lowRpm: (x: ITimelineEvent<'lowRpm', number>) => {
         const d = DIFFICULTY.value;
         LOW_LIMIT.value = x.detail + ((d > 0) ? (d * (-1/120 * d + 5 / 2)) : d);
      },
      debugAlert: (x: ITimelineEvent<'debugAlert', string>) => {
         alert(x.detail);
      },
   },
);

export const StoryManager = () => {
   ROUTER_ID.subscribe(() => {      
      if (isStory()) {
         const episode = Math.floor(Number.parseFloat(QUERY_PARAMETER.value.get('episode') ?? '0'));

         timeLine.storyId = episode;
   
         timeManager.addFn(timeLine.tick, FrameRateLevel.D0);
      } else {
         timeManager.removeFn(timeLine.tick);
         timeLine.reset();
      }
   });
};
