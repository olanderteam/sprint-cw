# Jira Proxy (Supabase Functions)

This directory is named `supabase` because it is required by the **Supabase CLI** environment.

## Purpose

The `functions/jira-data` function acts as a **Proxy** between the frontend dashboard and the Jira API.

It handles:
- **Authentication**: securely using Jira API tokens.
- **Aggregation**: fetching data from multiple boards, sprints, and issues.
- **Transformation**: converting raw Jira JSON into the dashboard's data model.

## Why keep it here?
Renaming this folder would break `supabase start` and `supabase deploy` commands.

## Configuration
Ensure your `.env` or Supabase secrets have:
- `JIRA_DOMAIN`
- `JIRA_EMAIL`
- `JIRA_API_TOKEN`
