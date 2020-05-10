import { createApp } from "./bootstrap";

export default async context => {

  const { app, router, store } = createApp()

  const meta = app.$meta()
  router.push(context.url)

  await new Promise((resolve, reject) => router.onReady(resolve, reject))

  const matchedComponents = router.getMatchedComponents()

  if (!matchedComponents.length) { throw new Error('404') }

  await Promise.all(matchedComponents.map(component => {
    if (component.asyncData) {
      return component.asyncData({
        store,
        route: router.currentRoute
      })
    }
  }))

  context.state = store.state
  context.meta = meta

  return app

}