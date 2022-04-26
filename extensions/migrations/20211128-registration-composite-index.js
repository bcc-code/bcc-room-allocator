module.exports = {
    async up(knex) {
        await knex.schema.table('registrations', (table) => {
            table.unique(['event', 'personId']);
        });
    },

    async down(knex) {
        await knex.schema.table('registrations', (table) => {
            table.dropUnique(['event', 'personId']);
        });
    },
};