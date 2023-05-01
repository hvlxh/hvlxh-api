import { readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'

import {
  Client,
  Collection,
  ChatInputApplicationCommandData,
  ApplicationCommandOptionType,
  ApplicationCommandSubGroupData
} from 'discord.js'
import { Command } from './base/Command'
import { Subcommand } from './base/Subcommand'

export interface LoadSlashOptions {
  global?: true
}

export async function loadSlash (
  path: string,
  client: Client,
  options: LoadSlashOptions
) {
  const commands: {
    array: ChatInputApplicationCommandData[]
    collection: Collection<string, Command>
  } = {
    array: [],
    collection: new Collection()
  }

  if ((await stat(path)).isDirectory()) {
    const files = await readdir(path)

    for await (const file of files) {
      if ((await stat(join(path, file))).isFile()) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const Cmd = require(join(process.cwd(), path, file))

        if (!Cmd) {
          throw new Error(
            `hvlxh: [Commands] "${file}" Commands doesn't have any exports`
          )
        }

        const cmd: Command = new Cmd()

        if (!cmd) {
          throw new Error(
            `hvlxh: [Commands] "${file}" Commands doesn't have any exports`
          )
        }

        commands.array.push(cmd.options)
        commands.collection.set(cmd.options.name, cmd)
      } else {
        const cmd: ChatInputApplicationCommandData = {
          name: file.toLowerCase(),
          description: 'No description provided',
          options: []
        }

        for await (const nFile of await readdir(join(path, file))) {
          if ((await stat(join(path, file, nFile))).isFile()) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const NCmd = require(join(process.cwd(), path, file, nFile))

            if (!NCmd) {
              throw new Error(
                `hvlxh: [Commands] "${file}" Commands doesn't have any exports`
              )
            }

            const nCmd: Subcommand = new NCmd()

            cmd.options?.push({
              ...nCmd.options,
              type: ApplicationCommandOptionType.Subcommand
            })
            commands.collection.set(`${cmd.name}/${nCmd.options.name}`, nCmd)
          } else {
            const nCmd: ApplicationCommandSubGroupData = {
              name: nFile.toLowerCase(),
              description: 'No description provided',
              type: ApplicationCommandOptionType.SubcommandGroup,
              options: []
            }

            for await (const nnFile of await readdir(
              join(process.cwd(), path, file, nFile)
            )) {
              // eslint-disable-next-line @typescript-eslint/no-var-requires
              const NCmd = require(join(
                process.cwd(),
                path,
                file,
                nFile,
                nnFile
              ))

              if (!NCmd) {
                throw new Error(
                  `hvlxh: [Commands] "${file}" Commands doesn't have any exports`
                )
              }

              const anCmd: Subcommand = new NCmd()

              nCmd.options.push({
                ...anCmd.options,
                type: ApplicationCommandOptionType.Subcommand
              })
              commands.collection.set(
                `${cmd.name}/${nCmd.name}/${anCmd.options.name}`,
                anCmd
              )
            }

            cmd.options?.push(nCmd)
          }
        }

        commands.array.push(cmd)
      }
    }
  }

  client.on('ready', () => {
    if (options.global) {
      client.application?.commands.set(commands.array)
    } else {
      client.guilds.cache.forEach(g => g.commands.set(commands.array))

      client.on('guildCreate', g => {
        g.commands.set(commands.array)
      })

      client.on('guildDelete', g => {
        g.commands.set([])
      })
    }
  })

  client.on('interactionCreate', interaction => {
    if (interaction.isChatInputCommand()) {
      let cmd

      try {
        if (interaction.options.getSubcommandGroup()) {
          const subCmd = interaction.options.getSubcommand()
          const subGroupCmd = interaction.options.getSubcommandGroup()

          cmd = commands.collection.get(
            `${interaction.commandName}/${subGroupCmd}/${subCmd}`
          )
        } else if (interaction.options.getSubcommand()) {
          const subCmd = interaction.options.getSubcommand()
          cmd = commands.collection.get(`${interaction.commandName}/${subCmd}`)
        }
      } catch {
        cmd = commands.collection.get(interaction.commandName)
      }

      if (!cmd) {
        interaction.reply({
          content: '404: Command not found.',
          ephemeral: true
        })
      }

      const runOptions = {
        client,
        options: interaction.options,
        interaction
      }

      cmd?.run(runOptions)
    }
  })
}
