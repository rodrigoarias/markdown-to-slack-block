# markdown-to-slack-block

A simple action that attemps to transform an input in markdown format to something compatible with an [Slack Block](https://api.slack.com/block-kit)

This action was created for a very specific purpuse so it supports only a few markdown elements.

## Inputs

## `markdown`

**Required** A string in markdown format.

## `text`

This action is probably being used to use the Slack API to send a message. The block requires a field text to be send, so if we added here we receive an string completely prepared to be used with [Slack-Send action](https://github.com/marketplace/actions/slack-send). See example.

## Outputs

## `slack-blocks`

A string as an Slack Blocks object.

## Example usage

Something like this:
```
## v 0.1.2
### 🚀 Features
  - Some cool feature [PR-51](https://github.com)
  ### 🐛 Bugs
  - This is for real [PR-49](https://github.com)
  - Fixing the cool feature [PR-50](https://github.com)
  - Fixing the fix of the feature [PR-60](https://github.com)
```

Its transformed into this:
```
{"blocks":[{"type":"section","text":{"type":"mrkdwn","text":"*v 0.1.2*","verbatim":true}},{"type":"divider"},{"type":"section","text":{"type":"mrkdwn","text":"*🚀 Features*","verbatim":true}},{"type":"section","text":{"type":"mrkdwn","text":"- Some cool feature  <https://github.com|PR-51>\n","verbatim":true}},{"type":"section","text":{"type":"mrkdwn","text":"*🐛 Bugs*","verbatim":true}},{"type":"section","text":{"type":"mrkdwn","text":"- This is for real  <https://github.com|PR-49>\n- Fixing the cool feature  <https://github.com|PR-50>\n- Fixing the fix of the feature  <https://github.com|PR-60>\n\n","verbatim":true}}]}
```
And gets rendered [like this](https://app.slack.com/block-kit-builder/T1CTWR9GX#%7B%22blocks%22:%5B%7B%22type%22:%22section%22,%22text%22:%7B%22type%22:%22mrkdwn%22,%22text%22:%22*v%200.1.2*%22,%22verbatim%22:true%7D%7D,%7B%22type%22:%22divider%22%7D,%7B%22type%22:%22section%22,%22text%22:%7B%22type%22:%22mrkdwn%22,%22text%22:%22*%F0%9F%9A%80%20Features*%22,%22verbatim%22:true%7D%7D,%7B%22type%22:%22section%22,%22text%22:%7B%22type%22:%22mrkdwn%22,%22text%22:%22-%20Some%20cool%20feature%20%20%3Chttps://github.com%7CPR-51%3E%5Cn%22,%22verbatim%22:true%7D%7D,%7B%22type%22:%22section%22,%22text%22:%7B%22type%22:%22mrkdwn%22,%22text%22:%22*%F0%9F%90%9B%20Bugs*%22,%22verbatim%22:true%7D%7D,%7B%22type%22:%22section%22,%22text%22:%7B%22type%22:%22mrkdwn%22,%22text%22:%22-%20This%20is%20for%20real%20%20%3Chttps://github.com%7CPR-49%3E%5Cn-%20Fixing%20the%20cool%20feature%20%20%3Chttps://github.com%7CPR-50%3E%5Cn-%20Fixing%20the%20fix%20of%20the%20feature%20%20%3Chttps://github.com%7CPR-60%3E%5Cn%5Cn%22,%22verbatim%22:true%7D%7D%5D%7D)


A full example in a github actions workflow would be somehing like this:
```
      - name: Markdown to slack
        uses: rodrigoarias/markdown-to-slack-block@v1.0.0
        id: slack
        with:
          markdown: ${{ steps.package.outputs.content }}
          text: "Some random message"
      
        
      - name: Send to slack
        uses: slackapi/slack-github-action@v1.23.0
        with:
          channel-id: '#a-channel'
          payload: ${{ steps.slack.outputs.slack-blocks }}
        env:
          SLACK_BOT_TOKEN: ${{ secrets.SLACK_API_KEY }}
```

## Local Testing

You can test the conversion locally without running the GitHub Action using the `test-local.js` script.

### Usage

```bash
# Direct markdown input
node test-local.js "## v1.0.0
### Features
- New feature [PR-1](https://github.com/example)"

# From a file
node test-local.js --file CHANGELOG.md

# With header
node test-local.js --file CHANGELOG.md --header "New Release!"

# With text field (for slack-send compatibility)
node test-local.js --file CHANGELOG.md --text "Check out the latest release"

# Combine options
node test-local.js --file CHANGELOG.md --header "Release" --text "New version available"
```

### Options

| Option | Short | Description |
|--------|-------|-------------|
| `--file` | `-f` | Read markdown from a file |
| `--text` | `-t` | Add text field to output |
| `--header` | `-h` | Add a header block |
| `--help` | | Show help message |
