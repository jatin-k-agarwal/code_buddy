import chalk from "chalk";

const compactLogo = chalk.magentaBright("🚀 code_buddy — automate your GitHub workflows");

// Custom ASCII Art Logo for 'code_buddy'
const customLogo = `
   '    _________            .___       __________          .___  .___      
'    \_   ___ \  ____   __| _/____   \______   \__ __  __| _/__| _/__.__.
'    /    \  \/ /  _ \ / __ |/ __ \   |    |  _/  |  \/ __ |/ __ <   |  |
'    \     \___(  <_> ) /_/ \  ___/   |    |   \  |  / /_/ / /_/ |\___  |
'     \______  /\____/\____ |\___  >  |______  /____/\____ \____ |/ ____|
'            \/            \/    \/          \/           \/    \/\/     
`;

const tagline = 'Your personal Git assistant';

// Banner logo 
function bannerLogo() {
  return chalk.cyan(customLogo) + chalk.magentaBright(`\n       ${tagline}`);
}

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
