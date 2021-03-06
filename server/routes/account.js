'use strict'
const controllers = require('../controllers')

module.exports = function (app) {
  app.route('/accounts/').get(controllers.account.getAccounts)

  app.route('/accounts/:codigo').get(controllers.account.getAccountsById)

  app.route('/account-types').get(controllers.account.getAccountTypes)

  app.route('/account-types/:codigo').get(controllers.account.getAccountTypesByCodigo)

  app.route('/account-types').post(controllers.account.createAccountTypes)

  app.route('/accounts').post(controllers.account.createAccount)

  app.route('/accounts/:codigo').put(controllers.account.editAccount)

}
