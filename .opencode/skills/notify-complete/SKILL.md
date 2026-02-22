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

I play a repeated completion sound to notify the user that the current conversation task has finished.

## Command

```bash
for i in $(seq 1 20); do afplay /System/Library/Sounds/Ping.aiff & sleep 0.5; done
```

## When to use me

- After finishing implementation/planning/testing in a conversation
- When the user needs an audible reminder to continue next action

## Usage

Run this skill at the end of the conversation once all requested outputs are delivered.

## Notes

- This skill is intended for macOS (`afplay` + system sound path).
- It intentionally repeats 20 times at 0.5 second intervals for high noticeability.
