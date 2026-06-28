# Snippedia Case Study

## Overview

Snippedia is a short-form knowledge discovery app that turns Wikipedia-powered learning into a swipeable, visual feed. The goal is to make credible educational content feel easier to start, easier to continue, and more natural on mobile devices.

## Problem

Traditional encyclopedia browsing is powerful but often dense. Users who are casually curious may leave before they find an entry point that feels approachable. Snippedia explores a different interaction model: start with quick, visual article snippets, then let curiosity pull the user deeper.

## Product Goals

- Reduce friction for discovering educational topics
- Make reading feel lightweight and continuous
- Preserve credibility by using Wikipedia and Wikimedia sources
- Support return visits with favorites, history, and reading stats
- Build a responsive PWA that works well on mobile and desktop

## Engineering Highlights

- React and TypeScript frontend built with Vite
- Wikipedia/Wikimedia API integration for article data and page views
- Search ranking improvements for ambiguous article titles
- Local persistence for reading history, favorites, and settings
- PWA support with offline-aware caching
- Share preview server for social metadata
- Open source repository hygiene with CI, security policy, and contribution guide

## Challenges

### Ambiguous Search Intent

Some queries map to multiple Wikipedia articles with similar titles. Snippedia improves ranking by prioritizing exact title matches before fallback relevance, which helps cases like programming terms that overlap with medical or cultural topics.

### Missing Article Metadata

Not every article has the same image or pageview data. The app includes fallbacks so a missing image or unavailable views endpoint does not break the reading experience.

### Deployment Hygiene

The project was prepared for open source release by removing generated-tool references, replacing hardcoded credentials with environment variables, and publishing from a clean repository without old Git history.

## Outcome

Snippedia demonstrates product thinking, frontend engineering, API integration, PWA behavior, deployment care, and open source readiness in one project.

Live demo: https://snippedia.app/
