import Storage from 'src/service/storage/base/Storage'
import Platform from 'src/service/PlatformService'

var storage = new Storage({
    size: 10,
    storageBackend: Platform.storage.local,
    defaultExpires: null,
    enableCache: true,
    sync: {}
});

export default storage;
