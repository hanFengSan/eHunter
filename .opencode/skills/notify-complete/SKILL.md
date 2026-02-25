---
name: notify-complete
description: Notify user with repeated ping sound after task completion
license: MIT
compatibility: opencode
metadata:
  type: completion-notification
  platform: macos
---

## What I do

I play notification sounds in two phases:

- Short notification before testing starts, to ask the user to get ready for intervention/observation.
- Long notification after task completion, to ask the user to step in for operation or acceptance.

## Commands

All notification commands should be launched asynchronously in background, so the main task flow does not block waiting for sound playback to finish.

### Test-start short notification

```bash
(for i in $(seq 1 5); do afplay /System/Library/Sounds/Ping.aiff; sleep 0.5; done) >/dev/null 2>&1 &
```

### Task-complete long notification

```bash
(for i in $(seq 1 10); do afplay /System/Library/Sounds/Ping.aiff; sleep 0.5; done) >/dev/null 2>&1 &
```

## When to use me

- Immediately before any testing starts (short notification)
- After every completed task in the conversation, regardless of task type (long notification)
- Especially when the user needs to intervene, operate manually, or perform acceptance

## Usage

Run this skill at two mandatory points by default:

1. Right before test execution starts: use the short notification command (5 times).
2. Right after task completion: use the long notification command (10 times).

This is mandatory by default unless the user explicitly asks to skip audio notification.

## Notes

- This skill is intended for macOS (`afplay` + system sound path).
- Short notification repeats 5 times at 0.5 second intervals.
- Long notification repeats 10 times at 0.5 second intervals.
