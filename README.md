# `action-mirror-commit-status`

This action mirrors a status check from one name to another on a single commit.

## Description

Why on earth would you need to mirror a status check? This is to work around [a
missing feature in Actions][discussion] combined with missing merge queue
support in some CI systems (Drone in our case).

This is the scenario:

- You have a CI system that doesn't support merge queues (like Drone).
- You have a required status check `continuous-integration/drone/pr` that must
  pass before anything can be pushed to the main branch.
- You'd like to enable GitHub merge queues.

The problem that happens is this:

- A PR passes its checks and the developer presses the "Merge" button to merge
  the PR via the merge queue.
- GitHub creates a temporary branch `gh-readonly-queue/<target branch>/...` and
  pushes your commit on top of the target branch.
- A `push` webhook is sent to the CI system, which starts a new build.
- The CI system runs it as it's configured to.
- In Drone's case, a status check `continuous-integration/drone/push` is created
  on the commit in the temporary branch, and set to "pending", then eventually
  "success", "failure" or "error".
- This check has a different name: it ends with `push` instead of `pr`.
- The merge queue is stuck.

This action is a workaround for that scenario. There is an event sent when
status checks are updated. This action listens for that event and mirrors the
status from one check to another.

[discussion]: https://github.com/orgs/community/discussions/47548

## Usage

In the above scenario, you would configure this action to run on the `status`
event, when the `branch` starts with`gh-readonly-queue/*` like so:

```yaml
on:
  status:

run-name:
  Mirror status ${{ github.event.context }} for ${{ github.ref }} (${{
  github.event_name }})

jobs:
  commit-status:
    if:
      github.event.context == 'continuous-integration/drone/push' &&
      startsWith(github.event.branches[0].name, 'gh-readonly-queue/main/')

    permissions:
      statuses: write

    runs-on: ubuntu-latest
    steps:
      - name: Mirror commit status
        uses: grafana/action-mirror-commit-status@sha123456
        with:
          to-status: continuous-integration/drone/pr
```

Note that this workflow needs to be present on the target branch (main in this
case).
