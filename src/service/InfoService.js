import store from '../store/index.inject'
import DialogBean from '../bean/DialogBean'
import DialogOperation from '../bean/DialogOperation'
import * as tags from '../assets/value/tags'
import TextReqService from '../service/request/TextReqService'
import config from '../config'
import ServerMessage from '../bean/ServerMessage'
import SettingService from '../service/SettingService'
import Logger from '../utils/Logger'

class InfoService {
    async showInstruction(isCompulsive) {
        let dialog = new DialogBean(
            isCompulsive ? tags.DIALOG_COMPULSIVE : tags.DIALOG_NORMAL,
            store.getters.string.instructionsAndAbouts,
            store.getters.string.p_instruction,
            new DialogOperation(store.getters.string.confirm, tags.DIALOG_OPERATION_TYPE_PLAIN, () => {
                return true;
            })
        );
        store.dispatch('addDialog', dialog);
    }

    async showBookInstruction(isCompulsive) {
        let dialog = new DialogBean(
            isCompulsive ? tags.DIALOG_COMPULSIVE : tags.DIALOG_NORMAL,
            store.getters.string.instructions,
            store.getters.string.p_bookInstrction,
            new DialogOperation(store.getters.string.confirm, tags.DIALOG_OPERATION_TYPE_PLAIN, () => {
                return true;
            })
        );
        store.dispatch('addDialog', dialog);
    }

    async checkUpdate() {
        let message;
        let lastShowDialogTime = await SettingService.getUpdateTime();
        Promise
            .race([
                new TextReqService(config.updateServer1, true, false).request(),
                new TextReqService(config.updateServer2, true, false).request()
            ])
            .then(data => {
                message = new ServerMessage(JSON.parse(data));
                let isNewVersion = message.version !== config.version;
                let isReleaseTime = new Date().getTime() > message.time;
                let isOverDuration = (new Date().getTime() - lastShowDialogTime) > message.duration;
                if (isNewVersion && isReleaseTime && isOverDuration) {
                    SettingService.setUpdateTime(new Date().getTime());
                    this.showUpdateInfo(message);
                }
            })
            .catch(e => {
                Logger.logObj('InfoService', e);
            });
    }

    showUpdateInfo(message) {
        let operations = [];
        operations.push(new DialogOperation(store.getters.string.later, tags.DIALOG_OPERATION_TYPE_PLAIN, () => {
            return true;
        }));
        message.operations.forEach(i => {
            operations.push(new DialogOperation(i.name, tags.DIALOG_OPERATION_TYPE_PLAIN, () => {
                window.open(i.url, '_blank');
                return true;
            }));
        });
        let dialog = new DialogBean(
            tags.DIALOG_COMPULSIVE,
            message.title,
            message.text,
            ...operations
        );
        store.dispatch('addDialog', dialog);
    }

    showReloadError(text) {
        let dialog = new DialogBean(
            tags.DIALOG_COMPULSIVE,
            store.getters.string.loadingFailed,
            text,
            new DialogOperation(store.getters.string.reload, tags.DIALOG_OPERATION_TYPE_PLAIN, () => {
                window.location.reload();
                return true;
            })
        );
        store.dispatch('addDialog', dialog);
    }

    async checkNewVersion() {
        if (await SettingService.getVersion() !== config.version) {
            let dialog = new DialogBean(
                tags.DIALOG_COMPULSIVE,
                `${store.getters.string.newVersion} v${config.version}`,
                store.getters.string.p_version,
                new DialogOperation(store.getters.string.confirm, tags.DIALOG_OPERATION_TYPE_PLAIN, () => {
                    return true;
                })
            );
            store.dispatch('addDialog', dialog);
            SettingService.setVersion(config.version);
        }
    }
}

let instance = new InfoService();
export default instance;
