import store from '../store'
import DialogBean from '../bean/DialogBean.ts'
import { DialogOperation, DOClick } from '../bean/DialogOperation'
import * as tags from '../assets/value/tags'
import TextReqService from '../service/request/TextReqService'
import ServerMessage from '../bean/ServerMessage.ts'
import SettingService from '../service/SettingService'
import Logger from '../utils/Logger'
import Formatter from '../utils/formatter'

class InfoService {
    async showInstruction(config, isCompulsive) {
        let dialog = new DialogBean(
            isCompulsive ? tags.DIALOG_COMPULSIVE : tags.DIALOG_NORMAL,
            store.getters.string.instructionsAndAbouts,
            Formatter.replaceKey(store.getters.string.p_instruction, {
                HOME_PAGE: config.homePage,
                VERSION: config.version
            }),
            new DialogOperation(store.getters.string.confirm, tags.DIALOG_OPERATION_TYPE_PLAIN, () => {
                return true;
            })
        )
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

    async checkUpdate(config) {
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

    // if updated a new version, shows messages
    async checkNewVersion(config) {
        if (await SettingService.getVersion() !== config.version && !(await SettingService.getFirstOpen())) {
            let dialog = new DialogBean(
                tags.DIALOG_COMPULSIVE,
                `${store.getters.string.versionUpdate} v${config.version}`,
                store.getters.string.p_version,
                new DialogOperation(store.getters.string.confirm, tags.DIALOG_OPERATION_TYPE_PLAIN, () => {
                    return true;
                })
            );
            store.dispatch('addDialog', dialog);
        }
        SettingService.setVersion(config.version);
    }
}

let instance = new InfoService();
export default instance;
