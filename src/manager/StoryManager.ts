import debug from 'debug';
import { Clip, Mp3DeMuxAdapter } from '@web-media/phonograph';
import { type DataItem, Timeline, type DataItemCollectionType, type TimelineOptions } from 'vis-timeline';
import 'vis-timeline/dist/vis-timeline-graph2d.css';

import { THEME_ID } from './ColorManager';

import { stories } from '../stories';
import { LOW_LIMIT } from '../stores/runStat';
import { DIFFICULTY } from '../stores/settings';
import { FrameRateLevel } from '../utils/TimeMagic';
import { globalAudioContext } from '../manager/AudioManager';
import type { IPlayAudioStoryEvent } from '../stories/utils';
import { QUERY_PARAMETER, ROUTER_ID, isStory } from '../stores/router';
import { type ITimelineEvent, TimelineManager } from '../utils/TimeLine';

import { timeManager } from './TimeManager';
import { forceSelect } from '../utils/forceSelect';

export const STORY_AUDIO_URL_BASE = 'https://resource.alice.is.not.ci/';

const log = debug('story');
const logAudio = log.extend('advanced-audio');
const logEnd = log.extend('end');
const logTheme = log.extend('theme');
const logLowRpm = log.extend('low-rpm');

export const timeLine = new TimelineManager(stories, {
   audio: (x: ITimelineEvent<'audio', IPlayAudioStoryEvent>) => {
      const clip = new Clip({
         context: globalAudioContext,
         url: STORY_AUDIO_URL_BASE + x.detail.url,
         adapter: new Mp3DeMuxAdapter(),
      });

      const id = x.detail.url;

      logAudio(`[load] [start] ${id}`);
      clip.canPlayThough.then((x) => {
         logAudio(`[play] [start] ${id}`);
         clip.play().then((x) => {
            logAudio(`[play] [ end ] ${id}`);
         });
      });

      clip.buffer().then(async () => {
         logAudio(`[load] [ end ] ${id}`);
      });

      return () => {
         clip.dispose();
      };
   },
   end: (x: ITimelineEvent<'end', null>) => {
      logEnd('Session finished');
      const $finishTraining = document.querySelector(
         '.finish-training',
      ) as HTMLDivElement | null;
      if ($finishTraining) {
         $finishTraining.click();
      }
   },
   theme: (x: ITimelineEvent<'theme', string>) => {
      logTheme(x.detail);
      THEME_ID.value = x.detail;
   },
   lowRpm: (x: ITimelineEvent<'lowRpm', number>) => {
      logLowRpm(x.detail);
      const d = DIFFICULTY.value;
      LOW_LIMIT.value = x.detail + (d > 0 ? d * ((-1 / 120) * d + 5 / 2) : d);
   },
   debugAlert: (x: ITimelineEvent<'debugAlert', string>) => {
      alert(x.detail);
   },
});

// @ts-ignore
window.timeLine = timeLine;
// @ts-ignore
window.nextEvent = timeLine.nextEvent;

export const StoryManager = () => {
   ROUTER_ID.subscribe(() => {
      if (isStory()) {
         const episode = Math.floor(
            Number.parseFloat(QUERY_PARAMETER.value.get('episode') ?? '0'),
         );

         timeLine.storyId = episode;

         timeManager.addFn(timeLine.tick, FrameRateLevel.D0);
      } else {
         timeManager.removeFn(timeLine.tick);
         timeLine.reset();
      }
   });
};

const convertTime = (totalMilliseconds: number) => {
   const milliseconds = totalMilliseconds % 1000;
   const totalSeconds = Math.floor(totalMilliseconds / 1000);
   const seconds = totalSeconds % 60;
   const totalMinutes = Math.floor(totalSeconds / 60);
   const minutes = totalMinutes % 60;
   const hours = Math.floor(totalMinutes / 60);

   return new Date(0, 0, 0, hours, minutes, seconds, milliseconds);
};

const convertStory = (x: ITimelineEvent<string, unknown>[]): DataItem[] => x.map((x, index) => ({
   id: index,
   content: x.label,
   start: convertTime(x.time),
   className: x.type,
}));

export const visualizeStory = (index = 0) => {
   const $container = forceSelect<HTMLDivElement>('.story-visualize-container');
   $container.classList.remove('hidden');
   const $story = forceSelect<HTMLDivElement>('#story-visualize');

   const items: DataItemCollectionType = convertStory(stories[index]);

   const options: TimelineOptions = {
      height: '30vh',
      timeAxis: { scale: 'minute', step: 2 },
      showMajorLabels: false,
   };

   // Create a Timeline
   const timeline = new Timeline($story, items, options);
};

// @ts-ignore
window.visualizeStory = visualizeStory;
