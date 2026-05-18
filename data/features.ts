export interface Feature {
  id: string;
  title: string;
  description: string;
}

export const FeatureIds = {
  IMAGE: '1',
  CLOCK: '2',
  PLATFORM: '3',
} as const;

export const FEATURES: Feature[] = [
  {
    id: FeatureIds.IMAGE,
    title: '图片展示',
    description: '展示一张网络图片',
  },
  {
    id: FeatureIds.CLOCK,
    title: '当前时间',
    description: '实时显示当前系统时间',
  },
  {
    id: FeatureIds.PLATFORM,
    title: '平台信息',
    description: '展示当前移动平台系统信息',
  },
];
