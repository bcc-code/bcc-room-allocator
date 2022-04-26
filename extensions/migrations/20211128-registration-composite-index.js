module.exports = {
    async up(knex) {
        await knex.schema.table('registrations', (table) => {
            table.unique(['event', 'person']);
        });
    },

    async down(knex) {
        await knex.schema.table('registrations', (table) => {
            table.dropUnique(['event', 'person']);
        });
    },
};