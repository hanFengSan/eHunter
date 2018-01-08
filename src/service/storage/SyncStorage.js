import Storage from 'src/service/storage/base/Storage'
import Platform from 'src/service/PlatformService'

var storage = new Storage({
    size: 100,
    storageBackend: Platform.storage.sync,
    defaultExpires: null,
    enableCache: true
});

export default storage;
