import * as t from 'io-ts';

const StatusEventCodec = t.type({
  state: t.union([
    t.literal('pending'),
    t.literal('success'),
    t.literal('failure'),
    t.literal('error')
  ]),
  target_url: t.union([t.string, t.null]),
  description: t.union([t.string, t.null]),
  commit: t.type({
    sha: t.string
  }),
  repository: t.type({
    owner: t.type({
      login: t.string
    }),
    name: t.string
  }),
  context: t.string
});

export type StatusEvent = t.TypeOf<typeof StatusEventCodec>;

export function isStatusEvent(payload: unknown): payload is StatusEvent {
  return StatusEventCodec.is(payload);
}
