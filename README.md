# Akbar Nur Rizqi — Portfolio

English-only dark portfolio website for [akbarnurrizqi.dev](https://akbarnurrizqi.dev), with live content loaded from Google Sheets and continuous deployment through Netlify.

## Local development

```bash
cd site
pnpm install
pnpm dev
```

## Content updates

Edit the public Google Sheet. Published rows are refreshed in visitors' browsers without rebuilding or changing source code. Keep each worksheet name and header row unchanged. Set `published` to `TRUE` to show a row; placeholders containing `TODO_NEEDS_INPUT` are hidden.

## Netlify deployment

Import this repository in Netlify. The root `netlify.toml` contains the build settings. Netlify's deployment URL is used automatically for social metadata. You can override it with `NEXT_PUBLIC_SITE_URL` when using a custom domain.

The contact form uses Netlify Forms and requires no paid backend. Submissions appear in the Netlify dashboard.
