export interface Feature {
  id: string;
  title: string;
  description: string;
}

export const FEATURES: Feature[] = [
  {
    id: '1',
    title: '图片展示',
    description: '展示一张网络图片',
  },
  {
    id: '2',
    title: '当前时间',
    description: '实时显示当前系统时间',
  },
  {
    id: '3',
    title: '平台信息',
    description: '展示当前移动平台系统信息',
  },
];
