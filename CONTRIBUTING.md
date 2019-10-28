# Contributing

First off, thanks for taking the time to contribute!

## Code of Conduct

This project and everyone participating in it is governed by the [Cryptii Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to hello@cryptii.com.

## How to contribute

### Reporting bugs or feature requests

Please follow these steps when creating an issue:

1. Make sure your issue hasn't been [reported already](https://github.com/cryptii/cryptii/issues).
2. Please don't report multiple unrelated bugs or requests in a single issue.
3. If your issue has security implications please refer to the [security policy](SECURITY.md).
4. Follow all instructions in the template.
5. Include debug information obtained by pressing `Ctrl+I` inside the app if relevant.

### Pull Requests

Please follow these steps to have your contribution considered:

1. Follow the [styleguides](#styleguides).
2. Write tests for your changes.
3. Successfully run `npm build`.
4. Create a pull request and follow all instructions in the template.

## Design Principles

- Carefully design long-term brick setting interfaces and keep them backwards compatible. This makes sure saved pipes can be restored at a later date.
- If at all possible, all operations and features should be client-side and not rely on connections to an external server.

## Styleguides

### Comments

- Capitalize comments ("// Repeat translation" not "// repeat translation")

### Git Commit Messages

1. Capitalize the subject line
2. Use the present tense ("Add feature" not "Added feature")
3. Use the imperative mood ("Move cursor to…" not "Moves cursor to…")
4. Do not end the subject line with a period
5. Limit the first line to 72 characters or less

### JavaScript Styleguide

All JavaScript must adhere to [JavaScript Standard Style](https://standardjs.com/).
