import { WorkspaceRadarData } from '@brainbox/client/types/radars';

export type RadarDataGetQueryInput = {
  type: 'radar.data.get';
};

export type RadarDataGetQueryOutput = Record<
  string,
  Record<string, WorkspaceRadarData>
>;

declare module '@brainbox/client/queries' {
  interface QueryMap {
    'radar.data.get': {
      input: RadarDataGetQueryInput;
      output: RadarDataGetQueryOutput;
    };
  }
}
