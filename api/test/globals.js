import chalk from 'chalk';

/* eslint-disable no-console */
global.printError = (error, filename, exit) => {
  console.log(chalk.red('---------- error ----------'));
  console.log(chalk.gray(`[ ${filename} ]`));
  console.log(chalk.red('---------- ----- ----------'));
  console.log(chalk.white(error));
  console.log(chalk.red('---------- error ----------'));
  if (exit) {
    process.exit(1);
  }
};

global.printMessage = (message, filename) => {
  console.log(chalk.blue('---------- message ----------'));
  console.log(chalk.gray(`[ ${filename} ]`));
  console.log(chalk.blue('---------- ----- ----------'));
  console.log(chalk.white(message));
  console.log(chalk.blue('---------- message ----------'));
};
