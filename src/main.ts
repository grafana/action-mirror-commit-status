import { context, getOctokit } from '@actions/github';
import { GitHub } from '@actions/github/lib/utils';
import type { StatusEvent } from '@octokit/webhooks-types';

import * as core from '@actions/core';

type Octokit = InstanceType<typeof GitHub>;

async function handleStatusEvent(
  octokit: Octokit,
  fromStatus: string,
  toStatus: string
) {
  const statusPayload = context.payload as StatusEvent;

  core.info('Status event:');
  core.info(JSON.stringify(statusPayload, null, 2));

  const {
    state,
    target_url,
    description,
    context: ctx,
    commit,
    repository
  } = statusPayload;

  if (ctx !== fromStatus) {
    core.info(`Status is not ${fromStatus}, skipping.`);
    return;
  }

  const { sha } = commit;

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

    const fromStatus = core.getInput('from-status', { required: true });
    const toStatus = core.getInput('to-status', { required: true });

    core.info(`Comparing checks from ${fromStatus} to ${toStatus}.`);

    switch (context.eventName) {
      case 'status':
        await handleStatusEvent(octokit, fromStatus, toStatus);
        break;
      default:
        core.setFailed(`The event ${context.eventName} is not supported.`);
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message);
  }
}
