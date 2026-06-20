import('./src/config/cloudinaryConfig.js')
    .then(m => {
        console.log('cloudinaryConfig ok', typeof m.default === 'function');
        return import('./src/models/project.model.js');
    })
    .then(m => {
        console.log('projectModel ok', typeof m.default === 'function');
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
