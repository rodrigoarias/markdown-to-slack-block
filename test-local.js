#!/usr/bin/env node

const fs = require('fs');

const titleRegex = /^#{1,2} /;
const subtitleRegex = /^#{3,6} /;
const linkRegex = /\[([^\[]+)\](\(.*\))/gm;
const linkUrlRegex = /(\(.*\))/gm;
const linkNameRegex = /\[([^\[]+)\]/gm;

const parseMarkdown = (markdown, options = {}) => {
  const blocks = [];
  let currentBlock;

  const { text, header } = options;

  if (header) {
    blocks.push({
      type: 'header',
      text: {
        type: 'plain_text',
        text: header
      }
    });
  }

  const lines = markdown.split('\n');

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (isTitle(line) || isSubtitle(line)) {
      if (currentBlock) {
        blocks.push(currentBlock);
      }
      currentBlock = createNewBlock();
      const regex = isTitle(line) ? titleRegex : subtitleRegex;
      currentBlock.text.text = `*${line.replace(regex, '')}*`;
      blocks.push(currentBlock);
      if (isTitle(line)) {
        blocks.push({ type: 'divider' });
      }
      currentBlock = undefined;
    } else {
      if (!currentBlock) {
        currentBlock = createNewBlock();
      }
      if (hasLink(line)) {
        currentBlock.text.text += `${line.replace(linkRegex, '')} ${convertMDLinkToSlackLink(line)}\n`;
      } else {
        currentBlock.text.text += line + '\n';
      }
    }
  }

  if (currentBlock) {
    blocks.push(currentBlock);
  }

  if (text) {
    return { text, blocks };
  }
  return blocks;
};

const hasLink = (line) => new RegExp(linkRegex).test(line);

const convertMDLinkToSlackLink = (line) => {
  const url = line.match(new RegExp(linkUrlRegex))[0].slice(1, -1);
  const name = line.match(new RegExp(linkNameRegex))[0].slice(1, -1);
  return `<${url}|${name}>`;
};

const isTitle = (line) => new RegExp(titleRegex).test(line);
const isSubtitle = (line) => new RegExp(subtitleRegex).test(line);

const createNewBlock = () => ({
  type: 'section',
  text: {
    type: 'mrkdwn',
    text: '',
    verbatim: true
  }
});

const printUsage = () => {
  console.log(`
Usage: node test-local.js [options] <markdown-content or file-path>

Options:
  --file, -f      Read markdown from a file
  --text, -t      Add text field to output (for slack-send compatibility)
  --header, -h    Add a header block
  --help          Show this help message

Examples:
  node test-local.js "## v1.0.0\\n### Features\\n- New feature"
  node test-local.js --file CHANGELOG.md
  node test-local.js --file CHANGELOG.md --header "New Release!"
  node test-local.js --file CHANGELOG.md --text "Check out the latest release"
`);
};

const main = () => {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    printUsage();
    process.exit(0);
  }

  let markdown = '';
  let text = '';
  let header = '';
  let isFile = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--file' || arg === '-f') {
      isFile = true;
    } else if (arg === '--text' || arg === '-t') {
      text = args[++i];
    } else if (arg === '--header' || arg === '-h') {
      header = args[++i];
    } else if (!arg.startsWith('-')) {
      markdown = arg;
    }
  }

  if (isFile && markdown) {
    try {
      markdown = fs.readFileSync(markdown, 'utf8');
    } catch (err) {
      console.error(`Error reading file: ${err.message}`);
      process.exit(1);
    }
  }

  if (!markdown) {
    console.error('Error: No markdown content provided');
    printUsage();
    process.exit(1);
  }

  const result = parseMarkdown(markdown, { text, header });
  console.log(JSON.stringify(result, null, 2));
};

main();
