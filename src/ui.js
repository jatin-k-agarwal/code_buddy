import chalk from "chalk";

// Compact single-line logo
const compactLogo = chalk.magentaBright("🚀 code_buddy — automate your GitHub workflows");

// Full ASCII logo for banner mode
const customLogo = `
'    _________            .___       __________          .___  .___      
'    \\_   ___ \\  ____   __| _/____   \\______   \\__ __  __| _/__| _/__.__.
'    /    \\  \\/ /  _ \\ / __ |/ __ \\   |    |  _/  |  \\/ __ |/ __ <   |  |
'    \\     \\___(  <_> ) /_/ \\  ___/   |    |   \\  |  / /_/ / /_/ |\\___  |
'     \\______  /\\____/\\____ |\\___  >  |______  /____/\\____ \\____ |/ ____|
'            \\/            \\/    \\/          \\/           \\/    \\/\\/     
`;

const tagline = chalk.magentaBright("       Your personal Git assistant");

// Banner generator
function bannerLogo() {
  return chalk.cyan(customLogo) + "\n" + tagline;
}

// Print logo + title
export function printHeader(commandTitle, mode = "banner") {
  if (mode === "compact") {
    console.log(compactLogo);
  } else {
    console.log(bannerLogo());
  }

  if (commandTitle) {
    console.log(chalk.blue.bold(`\n${commandTitle}\n`));
  }
}
