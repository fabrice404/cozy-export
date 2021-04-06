require('dotenv').config();
const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const main = async () => {
  let std = await exec(`ACH --url ${process.env.COZY_URL} export io.cozy.bank.accounts export-accounts.json`);
  console.log(std);

  std = await exec(`ACH --url ${process.env.COZY_URL} export io.cozy.bank.operations export-operations.json`);
  console.log(std);

  const accountsExport = JSON.parse(fs.readFileSync(`${__dirname}/export-accounts.json`, 'utf-8'));
  const operationsExport = JSON.parse(fs.readFileSync(`${__dirname}/export-operations.json`, 'utf-8'));

  const result = accountsExport['io.cozy.bank.accounts']
    .map((account) => ({
      name: account.originalNumber,
      balance: account.balance,
      available: account.balance,
      transactions: {
        done: operationsExport['io.cozy.bank.operations']
          .filter((op) => op.account === account.id)
          .map((op) => ({
            amount: op.amount,
            date: op.rawDate,
            name: op.originalBankLabel,
          })),
        pending: [],
      },
    }));

  fs.writeFileSync(process.env.EXPORT_PATH, JSON.stringify(result, null, 2));
};

main();