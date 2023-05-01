import { readdir, stat, access } from 'node:fs/promises'
import { join } from 'node:path'

import { Client, ClientEvents } from 'discord.js'
import { Event } from './base/Event'

/**
 * loadEvents Options
 */
export interface LoadEventsOptions {
  /**
   * if event's folder should not has subfolder
   */
  noSubfolder?: boolean
}

/**
 * Load the events
 *
 * @param path The path of the event folder. The folder should start WITH PROJECT DIR, NOT FILE DIR
 * @param client discord.js Client to define the events in it
 * @param options The additional options for it
 */
export async function loadEvents (
  path: string,
  client: Client,
  options?: LoadEventsOptions
) {
  if ((await stat(path)).isDirectory()) {
    const files = await readdir(path)

    for await (const file of files) {
      if ((await stat(join(path, file))).isFile()) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const Evt = require(join(process.cwd(), path, file.replace('.js', '')))

        if (!Evt) {
          throw new Error(
            `hvlxh: [Events] "${file}" events doesn't have any exports`
          )
        }

        const evt: Event<keyof ClientEvents> = new Evt()

        if (!evt) {
          throw new Error(
            `hvlxh: [Events] "${file}" events doesn't have any exports`
          )
        }

        if (!evt.options) {
          throw new Error(
            `hvlxh: [Events] "${file}" events doesn't have options`
          )
        } else if (!evt.options.name) {
          throw new Error(`hvlxh: [Events] "${file}" events doesn't have name`)
        }

        if (evt.options.once) client.once(evt.options.name, evt.run)
        else client.on(evt.options.name, evt.run)
      } else {
        if (options?.noSubfolder) {
          throw new Error(
            'hvlxh: [Events] no sub-folder allowed from your given options.'
          )
        } else {
          const files = await readdir(join(path, file))
          for (const _file of files) {
            if (!(await stat(join(path, file, _file))).isFile()) {
              throw new Error('hvlxh: [Events] no folder in sub-folder allowed')
            }

            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const Evt = require(join(process.cwd(), path, file, _file))

            if (Evt) {
              throw new Error(
                `hvlxh: [Events] "${file}/${_file}" events doesn't have any exports`
              )
            }

            const evt: Event<keyof ClientEvents> = new Evt()

            if (!evt) {
              throw new Error(
                `hvlxh: [Events] "${file}/${_file}" events doesn't have any exports`
              )
            }

            if (!evt.options) {
              throw new Error(
                `hvlxh: [Events] "${file}/${_file}" events doesn't have options`
              )
            } else if (!evt.options.name) {
              throw new Error(
                `hvlxh: [Events] "${file}/${_file}" events doesn't have name`
              )
            }

            if (evt.options.once) client.once(evt.options.name, evt.run)
            else client.on(evt.options.name, evt.run)
          }
        }
      }
    }
  } else {
    try {
      await access(path)
      throw new Error('hvlxh: [Events] given path is not an folder')
    } catch {
      throw new Error(
        'hvlxh: [Events] given path is not exists, maybe you sending the path from file?'
      )
    }
  }
}
