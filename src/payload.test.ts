import { isStatusEvent } from './payload';

describe('isStatusEvent', () => {
  it.each<{
    name: string;
    payload: { [key: string]: unknown };
    expected: boolean;
  }>([
    {
      name: 'the payload is valid',
      payload: {
        state: 'success',
        target_url: 'https://example.com',
        description: 'Build succeeded',
        commit: {
          sha: 'abc123'
        },
        repository: {
          owner: {
            login: 'octocat'
          },
          name: 'hello-world'
        },
        context: 'continuous-integration/jenkins'
      },
      expected: true
    },
    {
      name: 'fields are missing',
      payload: {
        state: 'success',
        description: 'Build succeeded',
        commit: {
          sha: 'abc123'
        },
        repository: {
          owner: {
            login: 'octocat'
          },
          name: 'hello-world'
        }
      },
      expected: false
    },
    {
      name: 'target_url has an invalid type',
      payload: {
        state: 'success',
        target_url: 123, // Invalid type
        description: 'Build succeeded',
        commit: {
          sha: 'abc123'
        },
        repository: {
          owner: {
            login: 'octocat'
          },
          name: 'hello-world'
        },
        context: 'continuous-integration/jenkins'
      },
      expected: false
    },
    {
      name: 'the state value is incorrect',
      payload: {
        state: 'in-progress', // Invalid value
        target_url: 'https://example.com',
        description: 'Build succeeded',
        commit: {
          sha: 'abc123'
        },
        repository: {
          owner: {
            login: 'octocat'
          },
          name: 'hello-world'
        },
        context: 'continuous-integration/jenkins'
      },
      expected: false
    },
    {
      name: "it's a valid payload with null target_url and description",
      payload: {
        state: 'pending',
        target_url: null,
        description: null,
        commit: {
          sha: 'abc123'
        },
        repository: {
          owner: {
            login: 'octocat'
          },
          name: 'hello-world'
        },
        context: 'continuous-integration/jenkins'
      },
      expected: true
    },
    {
      name: 'extra fields are fine',
      payload: {
        state: 'success',
        target_url: 'https://example.com',
        description: 'Build succeeded',
        commit: {
          sha: 'abc123',
          author: {
            name: 'Octocat' // this field is not in the schema
          }
        },
        repository: {
          owner: {
            login: 'octocat'
          },
          name: 'hello-world'
        },
        context: 'continuous-integration/jenkins'
      },
      expected: true
    }
  ])('should return $expected because $name', ({ payload, expected }) => {
    expect(isStatusEvent(payload)).toBe(expected);
  });
});
