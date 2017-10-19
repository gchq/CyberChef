import Packets from "../../operations/Packets.js";

/**
 * Packets module.
 *
 * Libraries:
 *  - Utils.js
 *
 * @author drkna [whytho@email]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
let OpModules = typeof self === "undefined" ? {} : self.OpModules || {};

OpModules.Packets = {
    "From Tcpdump":				Packets.runFromTcpdump,
	"Strip TCP Headers":		Packets.stripPacketHeader
};

export default OpModules;
