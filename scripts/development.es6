import '~/src/config/environment'
import './helpers/cssModulesHook.es6'
import './helpers/cleanAssetJson.es6'
import { ROOT } from '~/src/config/paths'
import path from 'path'
import http from 'http'
import koa from 'koa'
import mount from 'koa-mount'
import webpack from 'webpack'
import debug from 'debug'
import chokidar from 'chokidar'
import open from 'open'
import webpackConfig from '~/src/config/webpack.development.config'

const log = {
  app: debug('app'),
  hot: debug('hot-reload'),
}

const compiler = webpack(webpackConfig)
const app = koa()

app.keys = [ 'd0n7', '7311', '4ny0n3' ]

app.use(require('koa-webpack-dev-middleware')(compiler, {
  quiet: true,
  noInfo: true,
  stats: {
    colors: true,
    reasons: true,
  },
  publicPath: webpackConfig.output.publicPath,
}))

app.use(require('koa-webpack-hot-middleware')(compiler))

app.use(function *() {
  log.app('Mounting koa app')
  yield mount(require(ROOT + '/src/server'))
})
const server = http.createServer(app.callback())
global.socketServer = require(ROOT + '/src/server/sockets')(server)

const watcher = chokidar.watch(path.join(ROOT, '/src/server'))
log.hot('Watching server source')
watcher.on('ready', () => {
  watcher.on('all', () => {
    log.hot('Clearing /server/ module cache from server')
    Object.keys(require.cache).forEach((id) => {
      if (/\/server\//.test(id)) delete require.cache[id]
    })
  })
})

log.hot('Watching client app source')
compiler.plugin('done', () => {
  log.hot('Clearing /app/ module cache from server')
  Object.keys(require.cache).forEach((id) => {
    if (/\/app\//.test(id)) delete require.cache[id]
    if (/\/server\//.test(id)) delete require.cache[id]
  })
})

server.listen(process.env.PORT, () => {
  const URI = `http://localhost:${process.env.PORT}`
  log.app(`Serving`, URI)
  open(URI)
})
