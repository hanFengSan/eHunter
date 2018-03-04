import store from '../store/index.inject'
import DialogBean from '../bean/DialogBean'
import DialogOperation from '../bean/DialogOperation'
import * as tags from '../assets/value/tags'
// import Logger from '../utils/Logger'

class InfoService {
    showInstruction(isCompulsive) {
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
}

let instance = new InfoService();
export default instance;
