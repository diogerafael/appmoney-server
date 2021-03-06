'use strict'
const transactionAccount = require('../models').transactionAccount
const category = require('../models').category
const account = require('../models/').account

const services = require('../services')

const { Op } = require("sequelize");

const { calculateLimitAndOffset, paginate } = require('paginate-info')

module.exports = {

	async createTransactionAccount(req, res) {
		try {
			const obj = req.body
			const ret = await transactionAccount.create(obj)
			res.status(201).send({
					message: services.message.common.genericSuccessMessage,
					data: ret
				}
			)
		} catch (error) {
			res.status(500).send({
				error: error
			})
		}
	},


	async getTransactions(req, res) {
		try {

			let where = {};

			const {
				query: { currentPage, pageLimit }
			} = req;


			const { limit, offset } = calculateLimitAndOffset(currentPage, pageLimit);

			let userId;
			where.status = [0,1];

			if (req.query.user_id) {
				where.userId = req.query.user_id;
				userId = req.query.user_id;
			}
			if (req.query.type) {
				where.type = req.query.type
			}
			if (req.query.status) {
				where.status = req.query.status
			}
			if (req.query.date_start && req.query.date_end) {
				let dtInicial =  new Date(req.query.date_start);
				let dtFinal = new Date(req.query.date_end);
				dtInicial.setHours(0,0,0,9999);
				dtFinal.setHours(23,59,59,9999);
				where.createdAt= {
					[Op.between]: [dtInicial, dtFinal]
				}
			}
			if(req.query.accountId){
				where.accountId = req.query.accountId;
			}
			if(req.query.categoryId){
				where.categoryId = req.query.categoryId;
			}

			const totalTransaction = await transactionAccount.findAll({
				attributes: ['account_id', 'type',
					[transactionAccount.sequelize.fn('sum',
						transactionAccount.sequelize.col('transaction_accounts.transaction_value')), 'openingBalance']],
				include: [],
				where: where,
				group: ['`transaction_accounts`.account_id', 'transaction_accounts`.type'],

				raw: false,

				order: transactionAccount.sequelize.literal('openingBalance DESC')
			});

			let totalReceivable = await transactionAccount.findAll({
				attributes: ['account_id', 'type',
					[transactionAccount.sequelize.fn('sum',
						transactionAccount.sequelize.col('transaction_accounts.transaction_value')), 'openingBalance']],
				include: [
					// {
					// 	model: account,
					// 	attributes: ['description']
					// }
				],
				where: {
					userId: userId,
					type: [0], status: 1
				},
				group: ['`transaction_accounts`.account_id', 'transaction_accounts`.type'],

				raw: true,

				order: transactionAccount.sequelize.literal('openingBalance DESC')
			});

			let totalScore = await transactionAccount.findAll({
				attributes: ['account_id', 'type',
					[transactionAccount.sequelize.fn('sum',
						transactionAccount.sequelize.col('transaction_accounts.transaction_value')), 'openingBalance']],
				include: [
					// {
					// 	model: account,
					// 	attributes: ['description']
					// }
				],
				where: {
					userId: userId,
					type: [0], status: 1
				},
				group: ['`transaction_accounts`.account_id', 'transaction_accounts`.type'],

				raw: true,

				order: transactionAccount.sequelize.literal('openingBalance DESC')
			});


			const { rows, count } = await transactionAccount.findAndCountAll(
				{
					include: [
						{model: category},
						{model:account,attributes:['description']}
					],
					order: [
						['created_at', 'DESC']
					],
					where: where,
				}
			);

			const meta = paginate(currentPage, count, rows, pageLimit);

			res.status(200).send({
				status: services.message.common.genericSuccessMessage,
				//total: totalTransaction,
				totalReceivable:totalReceivable,
				totalScore:totalScore,
				data: rows,
				meta
			})

		} catch (e) {
			res.status(500).send({
				error: error
			})
		}
	},

	async getTransaction(req, res) {
		try {
			let userId;
			if (req.query.user_id) {
				userId = req.query.user_id;
			}

			const transactions = await transactionAccount.findOne({
				include: [
					{model: category}
				],
				order: [
					['created_at', 'DESC']
				],
				where: {userId: userId, id: req.params.codigo}
			})
			res.status(200).send({
				status: services.message.common.genericSuccessMessage,
				data: transactions
			})
		} catch (e) {
			console.error(e);
			res.status(500).send({
				error: error
			})
		}
	},

	async updateTransaction(req, res) {
		try {
			const obj = req.body
			const ret = await transactionAccount.update({
				note: obj.note,
				description: obj.description,
				type: obj.type,
				status: obj.status,
				paymentDate: obj.paymentDate,
				dueDate: obj.dueDate,
				transactionValue: obj.transactionValue,
				paymentValue: obj.paymentValue,
				accountId: obj.accountId,
				userId: obj.userId,
				categoryId: obj.categoryId
			}, {
				where: {
					id: req.params.codigo
				}
			})

			res.status(200).send({
					message: services.message.common.genericSuccessMessage,
					data: ret
				}
			)
		} catch (error) {
			res.status(500).send({
				error: error
			})
		}
	},

	async deleteTransaction(req, res) {
		try {
			const obj = req.body
			const ret = await transactionAccount.update({
				status: 2,
			}, {
				where: {
					id: req.params.codigo
				}
			})

			res.status(200).send({
					message: services.message.common.genericSuccessMessage,
					data: ret
				}
			)
		} catch (error) {
			res.status(500).send({
				error: error
			})
		}
	}

}
