import { LauncherApp, LauncherAppPlugin } from '../app'
import { join, dirname } from 'path'
import { ensureDir, writeFile, readFile } from 'fs-extra'
import { createWriteStream } from 'fs'
import { ZipFile } from 'yazl'
import { Logger } from '../infra/logger'
import { LaunchService } from '../launch'
import { InstanceOptionsService } from '../instance'
import { ModulaClientService } from './ModulaClientService'

/**
 * Modula Client - Launcher Middleware
 * Injects custom UI modifications (like the watermark) directly into launch options.
 */
const pluginModulaClient: LauncherAppPlugin = (app: LauncherApp) => {
  const logger = app.getLogger('ModulaClientPlugin')

  try {
    Promise.all([
      app.registry.get(LaunchService),
      app.registry.get(ModulaClientService),
      app.registry.get(InstanceOptionsService),
    ]).then(([launchService, modulaService, optionsService]) => {
      launchService.registerMiddleware({
        name: 'modula-client-injector',
        async onBeforeLaunch(input: any, payload: any, context: any) {
          if (payload.side === 'client') {
            const port = await app.serverPort
            
            // 1. Universal Port Lock - Ensure authlib-injector uses the correct port
            if (payload.options.yggdrasilAgent) {
              const getAddress = (p: number) => `http://localhost:${p}/yggdrasil`
              const oldServer = payload.options.yggdrasilAgent.server
              
              if (oldServer === 'x://dev' || oldServer.includes('x://dev') || oldServer.includes('25555')) {
                payload.options.yggdrasilAgent.server = getAddress(port)
                logger.log(`[Modula] Resolved Yggdrasil server: ${oldServer} -> ${payload.options.yggdrasilAgent.server}`)
              }

              // Patch Prefetched Metadata
              if (payload.options.extraJVMArgs) {
                const prefetchedIndex = payload.options.extraJVMArgs?.findIndex((v: string) => v.includes('authlibinjector.yggdrasil.prefetched')) ?? -1
                if (prefetchedIndex >= 0) {
                  try {
                    const prefetchedBase64 = payload.options.extraJVMArgs[prefetchedIndex].split('=')[1]
                    let prefetched = Buffer.from(prefetchedBase64, 'base64').toString('utf8')
                    if (prefetched.includes('25555')) {
                      prefetched = prefetched.replace(/25555/g, port.toString())
                      payload.options.extraJVMArgs[prefetchedIndex] = `-Dauthlibinjector.yggdrasil.prefetched=${Buffer.from(prefetched).toString('base64')}`
                      logger.log(`[Modula] Port fixed in prefetched metadata.`)
                    }
                  } catch (e: any) {
                     logger.warn('Failed to patch prefetched metadata in middleware:', e)
                  }
                }
              }
            }

            // 2. Simple Setup
            const instancePath = payload.options.gamePath
            await modulaService.initModulaClient(instancePath)
            
            logger.log('Modula Client 1.4.0 minimal launch sequence complete.')
          }
        }
      })
    }).catch(e => {
      logger.warn('Failed to initialize Modula Client Plugin Registry:', e)
      logger.error(e)
    })
  } catch (e) {
    console.error('CRITICAL: Modula Client Plugin failed to start!')
    console.error(e)
  }
}

async function createModulaResourcePack(destPath: string, app: LauncherApp, logger: Logger) {
  // Disabled for 1.4.0 release due to runtime issues
  return Promise.resolve()
}

export default pluginModulaClient
