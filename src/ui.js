import chalk from "chalk";

const compactLogo = chalk.magentaBright("🚀 code_buddy — automate your GitHub workflows");

// Custom ASCII Art Logo for 'code_buddy'
const customLogo = `
    ██████╗ ██╗███████╗███████╗██╗   ██╗
    ██╔════╝ ██║██╔════╝██╔════╝╚██╗ ██╔╝
    ██║  ███╗██║███████╗███████╗ ╚████╔╝
    ██║   ██║██║╚════██║╚════██║  ╚██╔╝
    ╚██████╔╝██║███████║███████║   ██║
     ╚═════╝ ╚═╝╚══════╝╚══════╝   ╚═╝
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
