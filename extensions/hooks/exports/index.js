const { AsyncParser } = require('json2csv');

module.exports = function registerHook({action, filter}, { services }) {
    const { ItemsService, FilesService } = services;

    const generateFile = async function(from, title, {schema, database}) {
        const RegistrationsService = new ItemsService('registrations', {schema, knex: database})

        const query = {
            page: 0,
            filter: {
                status: {
                    _eq: true
                },
                room: {
                    _nnull: true
                }
            },
            fields: [
                'id',
                'group',
                'room',
                'date_updated'
            ]
        }

        if (from) {
            query.filter.date_updated = {
                _gte: from
            }
        }

        /* Make sure there is actually data to export */
        const regs = await RegistrationsService.readByQuery(query)
        if (! regs.length) {
            return false
        }

        const FileService = new FilesService({ schema });

        const payloadWithRequiredFields = {
            title,
            filename_download: `${title}.csv`,
            type: 'text/csv',
            charset: 'utf-8',
            storage: 'gcs',
        };

        const json2csv = new AsyncParser({}, { objectMode: true });

        json2csv.transform._read = async () => {
            ++query.page
            const regs = await RegistrationsService.readByQuery(query)

            if (regs.length) {
                regs.forEach(r => {
                    json2csv.input.push({
                        PersonId: r.id,
                        TeamId: r.group,
                        RoomNo: r.room,
                        Updated: r.date_updated,
                    })
                })
            } else {
                json2csv.input.push(null);
            }
        }

        return await FileService.uploadOne(json2csv.processor, payloadWithRequiredFields);
    }

    const runExport = async function(id, context) {
        const {schema, database} = context
        const ExportsService = new ItemsService('exports', {schema, knex: database})

        const newExportJob = await ExportsService.readOne(id)

        let exportFrom = newExportJob.change_since;

        if (! exportFrom) {
            const previousJobs = await ExportsService.readByQuery({
                sort: ['-date_created'],
                limit: 1,
                filter: {
                    _and: [
                        { id: { _neq: id } },
                        { status: { _eq: 'published' } }
                    ]
                }
            })

            if (previousJobs.length) {
                exportFrom = previousJobs[0].date_created
            }
        }

        await ExportsService.updateOne(newExportJob.id, {
            status: 'pending',
            change_since: exportFrom
        }, { emitEvents: false })

        const file = await generateFile(exportFrom, newExportJob.date_created, context)

        if (file) {
            await ExportsService.updateOne(newExportJob.id, {
                file,
                status: 'published'
            }, {emitEvents: false})
        } else {
            await ExportsService.deleteOne(newExportJob.id)
        }
    }

    action('exports.items.create', async ({ key, collection}, context) => {
        return runExport(key, context)
    })

    filter('exports.items.delete', async (keys, {}, context) => {
        const {schema, database} = context

        const ExportsService = new ItemsService('exports', {schema, knex: database})
        const FileService = new FilesService({ schema });

        const exports = await ExportsService.readMany(keys)
        const fileIds = exports.map(e => e.file).filter(fileId => fileId)

        if (fileIds.length) {
            return await FileService.deleteMany(fileIds)
        }
    })
};