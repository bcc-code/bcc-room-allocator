"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function register(router, { database, services }) {
    const { PanelsService } = services;
    router.get('/query/:id', async function (req, res) {
        const service = new PanelsService({
            accountability: req.accountability,
            schema: req.schema,
        });
        const panel = await service.readOne(req.params.id);
        let { sql } = panel.options;
        const blacklistSql = new RegExp(['delete', 'update', 'insert', 'execute', 'kill', 'drop'].map(item => `\\b${item}\\b`).join('|'));
        if (blacklistSql.test(sql.toLowerCase())) {
            return res.status(400).json({
                error: 'SQL query is blacklisted'
            });
        }
        sql = sql.replace('{{dashboard}}', panel.dashboard);
        try {
            const [rows, fields] = await database.raw(sql);
            return res.json({
                items: rows,
                headers: fields.map(v => {
                    return { text: v.name, value: v.name };
                })
            });
        }
        catch (e) {
            res.status(500).json({
                error: e.message
            });
        }
    });
}
module.exports = register;
