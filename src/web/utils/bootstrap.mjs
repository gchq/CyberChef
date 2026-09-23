import {
    Collapse,
    Dropdown,
    Input,
    Modal,
    Popover,
    Ripple,
    Tab,
    Tooltip,
    initMDB
} from "mdb-ui-kit/js/mdb.es.min.js";


/**
 * Initialises MDB/Bootstrap components used by the app.
 */
function initBootstrapMaterialComponents() {
    initMDB({
        Collapse,
        Dropdown,
        Input,
        Modal,
        Popover,
        Ripple,
        Tab,
        Tooltip
    }, true);
}


export default initBootstrapMaterialComponents;
