import * as core from '@actions/core';
import * as actionsGitHub from '@actions/github';
import { context, getOctokit } from '@actions/github';
import { WebhookPayload } from '@actions/github/lib/interfaces';
import { mock, mockClear, mockDeep } from 'jest-mock-extended';

import { run } from './main';
import { StatusEvent } from './payload';

let getInputMock: jest.SpiedFunction<typeof core.getInput>;
let getOctokitMock: jest.SpiedFunction<typeof getOctokit>;
let setFailedMock: jest.SpiedFunction<typeof core.setFailed>;

let contextMock = mock<typeof context>();

jest.mock('@actions/github');

const octokitMock = mockDeep<ReturnType<typeof getOctokit>>();

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockClear(contextMock);
    mockClear(octokitMock);

    contextMock = mock<typeof context>({
      eventName: 'status',
      payload: mock<StatusEvent>({
        state: 'pending',
        target_url: null,
        description: null,
        commit: { sha: 'abc123' },
        repository: { owner: { login: 'owner' }, name: 'repo' },
        context: 'foo'
      })
    });

    getInputMock = jest.spyOn(core, 'getInput').mockImplementation(name => {
      switch (name) {
        case 'github-token':
          return 'token';
        case 'to-status':
          return 'bar';
        default:
          return '';
      }
    });
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation();

    jest.replaceProperty(actionsGitHub, 'context', contextMock);
    getOctokitMock = jest
      .spyOn(actionsGitHub, 'getOctokit')
      .mockImplementation(() => octokitMock);
  });

  it('runs when the event is "status"', async () => {
    context.eventName = 'status';

    await run();

    expect(getInputMock).toHaveBeenCalledWith('github-token', {
      required: true
    });

    expect(getInputMock).toHaveBeenCalledWith('to-status', {
      required: true
    });

    expect(getOctokitMock).toHaveBeenCalledWith('token');

    expect(octokitMock.rest.repos.createCommitStatus).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      sha: 'abc123',
      state: 'pending',
      target_url: null,
      description: null,
      context: 'bar'
    });

    expect(setFailedMock).not.toHaveBeenCalled();
  });

  it("fails when the event isn't supported", async () => {
    context.eventName = 'pull_request';

    await run();

    expect(setFailedMock).toHaveBeenCalledWith(
      expect.stringContaining('not supported')
    );
  });

  it('fails if context is missing from payload', async () => {
    context.eventName = 'status';

    // Simulate missing payload
    context.payload = undefined as unknown as WebhookPayload;

    await run();

    expect(setFailedMock).toHaveBeenCalledWith(
      expect.stringContaining('Invalid payload')
    );
  });

  it('handles GitHub API request failure gracefully', async () => {
    context.eventName = 'status';

    octokitMock.rest.repos.createCommitStatus.mockRejectedValueOnce(
      new Error('API failure')
    );

    await run();

    expect(setFailedMock).toHaveBeenCalledWith('API failure');
  });
});
