import { Platform } from './types'

const NH_STYLE_ID = 'ehunter-host-block-style-nh'
const EH_SCRIPT_ID = 'ehunter-host-block-script-eh'
const NH_SCRIPT_ID = 'ehunter-host-block-script-nh'

function appendStyleOnce(id: string, cssText: string): void {
  if (document.getElementById(id)) {
    return
  }

  const style = document.createElement('style')
  style.id = id
  style.textContent = cssText
  ;(document.head || document.documentElement).appendChild(style)
}

function appendScriptOnce(id: string, scriptText: string): void {
  if (document.getElementById(id)) {
    return
  }

  const script = document.createElement('script')
  script.id = id
  script.textContent = scriptText
  ;(document.head || document.documentElement).appendChild(script)
}

function blockEHHostActions(): void {
  appendScriptOnce(
    EH_SCRIPT_ID,
    `
      if (typeof timerId === 'undefined') {
        const timerId = window.setInterval(() => {
          if (document.onkeyup) {
            window.onpopstate = null;
            window.clearInterval(timerId);
            load_image_dispatch = () => {};
            api_response = () => {};
            _load_image = () => {};
            nl = () => {};
            hookEvent = () => {};
            scroll_space = () => {};
            document.onkeydown = () => {};
            document.onkeyup = () => {};
          }
        }, 1000);
      }
    `
  )
}

function blockNHHostActions(): void {
  appendScriptOnce(
    NH_SCRIPT_ID,
    `
      console._clear = console.clear;
      console.clear = function () {};
    `
  )

  appendStyleOnce(
    NH_STYLE_ID,
    '.ts-im-container { display: none !important; }'
  )
}

export function applyPlatformHostActions(platform: Platform): void {
  if (platform === Platform.EH) {
    blockEHHostActions()
    return
  }

  if (platform === Platform.NH) {
    blockNHHostActions()
  }
}
