import {
  ChatInputApplicationCommandData,
  CommandInteraction,
  CommandInteractionOptionResolver,
  Client
} from 'discord.js'

export interface CommandRun {
  interaction: CommandInteraction
  options: Omit<CommandInteractionOptionResolver, 'getMessage' | 'getFocused'>
  client: Client
}

export abstract class Command {
  readonly options: ChatInputApplicationCommandData

  constructor (options: ChatInputApplicationCommandData) {
    this.options = options
  }

  public abstract run(options: CommandRun): void
}
