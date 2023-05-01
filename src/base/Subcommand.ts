import {
  ApplicationCommandSubCommandData,
  CommandInteraction,
  CommandInteractionOptionResolver,
  Client
} from 'discord.js'

export interface SubcommandRun {
  interaction: CommandInteraction
  options: Omit<CommandInteractionOptionResolver, 'getMessage' | 'getFocused'>
  client: Client
}

export abstract class Subcommand {
  readonly options: Omit<ApplicationCommandSubCommandData, 'type'>

  constructor (options: Omit<ApplicationCommandSubCommandData, 'type'>) {
    this.options = options
  }

  public abstract run(options: SubcommandRun): void
}
