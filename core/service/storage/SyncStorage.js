import Storage from './base/Storage'
import Platform from '../PlatformService'

var storage = new Storage({
    size: 10,
    storageBackend: Platform.storage.sync,
    defaultExpires: null,
    enableCache: true,
    sync: {}
});

export default storage;
