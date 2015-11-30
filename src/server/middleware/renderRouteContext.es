import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { Html } from '~/src/server/components/Html'
import { makeContent } from '~/src/app/utils/makeContent'
import { store } from '~/src/app/state/store'

function makeHtml(initialState, assets, content) {
  return ReactDOMServer.renderToString(
    <Html
      initialState={initialState}
      headScripts={[ assets.javascript.head ]}
      bodyScripts={[ assets.javascript.body ]}
      headStyles={[ assets.styles.body ]}
      bodyStyles={[]}
      children={content}
    />
  )
}

export default function renderRouteContext(assets) {
  return function *() {
    const { routeContext } = this
    const html = makeHtml(
      store.getState(),
      assets,
      makeContent(routeContext, store)
    )
    this.response.body = `<!doctype html>${html}`
  }
}
