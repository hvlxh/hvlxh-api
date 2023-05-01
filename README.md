# hvlxh-api

A API/Framework for discord.js to handle slash commands and events easily!

# Usage

## Commands:

```js
// index.js
const hvlxh = require('hvlxh-api')

hvlxh.loadSlash('main/commands', client, { global: true })

// main/commands/test.js
const { Command } = require('hvlxh-api')

class Test extends Command {
  constructor() {
    super({
      name: 'test',
      description: 'Test'
    })
  }

  /**
   * @param {import('hvlxh-api').CommandRun} param1
   */
  run({ interaction }) {
    interaction.reply('replied')
  }
}

module.exports = Test

// main/commands/test/a.js main/commands/test/a/a.js
const { Subcommand } = require('hvlxh-api')

class Test extends Subcommand {
  constructor() {
    super({
      name: 'test',
      description: 'Test'
    })
  }

  /**
   * @param {import('hvlxh-api').CommandRun} param1
   */
  run({ interaction }) {
    interaction.reply('replied')
  }
}

module.exports = Test
```

## Events

```js
// index.js
const hvlxh = require('hvlxh-api')

hvlxh.loadEvents('main/events', client, { global: true })

// main/events/ready.js
const { Event } = require('hvlxh-api')

class Ready extends Event {
  constructor() {
    super({
      name: 'ready',
      nick: 'Ready',
      once: true
    })
  }

  run() {
    console.log('Ready')
  }
}

module.exports = Ready
```
