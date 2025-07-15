// src/apis/github.ts
import type { GithubIssue } from '@yliu/types/issues';
import type { Repo } from '@yliu/types/repo';
import axios from 'axios';

const GITHUB_API_BASE = 'https://api.github.com';

export async function fetchGitHubIssues(
  owner: string,
  repo: string,
  token?: string,
): Promise<GithubIssue[]> {
  const perPage = 100;
  let page = 1;
  const allIssues: GithubIssue[] = [];
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  while (true) {
    const response = await axios.get(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues`,
      {
        headers,
        params: { per_page: perPage, page },
      },
    );

    if (response.data.length === 0) {
      break;
    }
    allIssues.push(...response.data);
    page++;
  }
  return allIssues;
}

export async function fetchRepoDetails(
  owner: string,
  repo: string,
  token?: string,
): Promise<Repo> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  const response = await axios.get(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}`,
    {
      headers,
    },
  );
  return response.data;
}
