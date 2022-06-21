const { AsyncParser } = require('json2csv');

module.exports = function registerHook({action, filter}, { services, env }) {
    const { ItemsService, FilesService } = services;

    const generateFile = async function(from, exportJob, {schema, database}) {
        const RegistrationsService = new ItemsService('registrations', {schema, knex: database})

        const query = {
            page: 0,
            filter: {
                status: {
                    _eq: true
                }
            },
            fields: [
                'room.id',
                'room.name',
                'group.id',
                'group.name',
                'person_id',
                'gender',
                'age',
                'room.requests',
                'room.arrival',
                'room.departure',
                'date_updated',
            ]
        }

        if (exportJob.event) {
            query.filter.event = {
                _eq: exportJob.event.id
            }
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

        const title = (exportJob.event?.reference || 'export') + '-' +
            exportJob.date_created.split(':').splice(0,2).join(':')

        const payloadWithRequiredFields = {
            title,
            filename_download: `${title}.csv`,
            type: 'text/csv',
            charset: 'utf-8',
            storage: env.STORAGE_LOCATIONS[0] ?? 'local',
        };

        const json2csv = new AsyncParser({}, { objectMode: true });

        json2csv.transform._read = async () => {
            ++query.page
            const regs = await RegistrationsService.readByQuery(query)

            if (regs.length) {
                regs.forEach(r => {
                    json2csv.input.push({
                        RoomId: r.room?.id ?? '–',
                        RoomName: r.room?.name ?? '–',
                        GroupId: r.group.id,
                        GroupName: r.group.name,
                        PersonId: r.person_id,
                        Gender: r.gender,
                        Arrival: r.room?.arrival ?? '–',
                        Departure: r.room?.departure ?? '–',
                        SpecialRequests: r.room?.requests ?? '–',
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

        const newExportJob = await ExportsService.readOne(id, {
            fields: [
                '*',
                'event.id',
                'event.reference',
            ]
        })

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

        const file = await generateFile(exportFrom, newExportJob, context)

        if (file) {
            await ExportsService.updateOne(newExportJob.id, {
                file,
                status: 'published'
            }, {emitEvents: false})
        } else {
            await ExportsService.deleteOne(newExportJob.id)
        }
    }

    action('exports.items.create', async ({ key }, context) => {
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