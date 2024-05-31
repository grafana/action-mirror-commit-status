import { context, getOctokit } from '@actions/github';
import { GitHub } from '@actions/github/lib/utils';

import * as core from '@actions/core';

import { isStatusEvent } from './payload';

type Octokit = InstanceType<typeof GitHub>;

class InvalidPayloadError extends Error {
  constructor(private readonly payload: unknown) {
    super();
    this.name = 'InvalidPayloadError';
  }

  get message(): string {
    return `Invalid payload: ${JSON.stringify(this.payload, null, 2)}`;
  }
}

async function handleStatusEvent(octokit: Octokit, toStatus: string) {
  if (!isStatusEvent(context.payload)) {
    throw new InvalidPayloadError(context.payload);
  }

  core.debug('Dumping event payload:');
  core.debug(JSON.stringify(context.payload, null, 2));

  const {
    state,
    target_url,
    description,
    commit: { sha },
    repository,
    context: fromStatus
  } = context.payload;

  core.info(
    `Copying status '${state} from '${fromStatus}' to '${toStatus}' for commit '${sha}'`
  );

  return await octokit.rest.repos.createCommitStatus({
    owner: repository.owner.login,
    repo: repository.name,
    sha,
    state,
    target_url,
    description,
    context: toStatus
  });
}

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const token = core.getInput('github-token', { required: true });
    const octokit = getOctokit(token);

    const toStatus = core.getInput('to-status', { required: true });

    switch (context.eventName) {
      case 'status':
        await handleStatusEvent(octokit, toStatus);
        break;
      default:
        core.setFailed(`The event ${context.eventName} is not supported.`);
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message);
  }
}
