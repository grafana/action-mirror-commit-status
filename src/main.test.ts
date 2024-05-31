import { context } from '@actions/github';
import type { StatusEvent } from '@octokit/webhooks-types';
import { mock, mockClear } from 'jest-mock-extended';

import * as core from '@actions/core';

import * as main from './main';

// Mock the GitHub Actions core library
let getInputMock: jest.SpiedFunction<typeof core.getInput>;
let setFailedMock: jest.SpiedFunction<typeof core.setFailed>;

const payloadMock: StatusEvent = mock<StatusEvent>();
const contextMock = mock<typeof context>({
  payload: payloadMock
});

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockClear(contextMock);
    mockClear(payloadMock);

    jest.mock('@actions/github', () => ({
      context: contextMock,
      getOctokit: jest.fn()
    }));

    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation();
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation();
  });

  it('runs when the event is "status"', async () => {
    context.eventName = 'status';

    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'github-token':
          return 'token';
        default:
          return '';
      }
    });

    await main.run();

    expect(getInputMock).toHaveBeenCalledWith('github-token', {
      required: true
    });
    expect(setFailedMock).not.toHaveBeenCalled();
  });

  it("fails when the event isn't supported", async () => {
    context.eventName = 'pull_request';

    await main.run();

    expect(setFailedMock).toHaveBeenCalled();
  });
});
