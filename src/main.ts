import { context, getOctokit } from '@actions/github';
import { GitHub } from '@actions/github/lib/utils';
import type { StatusEvent } from '@octokit/webhooks-types';

import * as core from '@actions/core';

type Octokit = InstanceType<typeof GitHub>;

async function handleStatusEvent(octokit: Octokit) {
  const statusPayload = context.payload as StatusEvent;

  core.info('Status event:');
  core.info(JSON.stringify(statusPayload, null, 2));
}

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const token = core.getInput('github-token', { required: true });
    const octokit = getOctokit(token);

    const fromCheck = core.getInput('from-check', { required: true });
    const toCheck = core.getInput('to-check', { required: true });

    switch (context.eventName) {
      case 'status':
        await handleStatusEvent(octokit);
        break;
      default:
        core.setFailed(`The event ${context.eventName} is not supported.`);
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message);
  }
}
