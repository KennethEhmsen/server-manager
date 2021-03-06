/**
 * manageLevels.js - JS File for levels managing
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license NTOSL (Custom) - View LICENSE.md in the root of the project
 * @copyright (C) Ad5001 2017
 * @package PocketMine Server Manager
 */
var MDCMenuLvl = new mdc.menu.MDCSimpleMenu(document.getElementById(`menuActionsLevel`)); // Defining real menu;
var levelAddGeneratorSelect;
window.serverCallbacks.push(function(server) {
    var levelsList = document.getElementById("manageLevelsList").children;
    for (var i = 0; i < levelsList.length; i++) {
        if (!server.levels[levelsList[i].id.substring(11)]) {
            levelsList[i].remove();
        }
    }
    if (Object.keys(server.levels).length < 1) {
        document.getElementById("noLevels").style.display = "block";
    } else {
        document.getElementById("noLevels").style.display = "none";
        Object.keys(server.levels).forEach(function(key) {
            if (!document.getElementById(`manageLevel${key}`)) {
                document.getElementById("manageLevelsList").innerHTML += `
                <li class="mdc-list-item" id="manageLevel${key}">
                    <span id="manageLevel${key}Props" class=" mdc-list-item__start-detail">
                        <i class="material-icons" title="World">public</i>
    		        </span>
                    <span class="mdc-list-item__text">
    		            ${key}
                    </span>
                    <span class="mdc-list-item__end-detail">
                        <i class="material-icons" id="actionsLevel${key}"
                        onclick="window.displayLevelMenu(event, '${key}')">more_vert</i>
                    </span>
                </li>`;
                mdc.ripple.MDCRipple.attachTo(document.getElementById("manageLevel" + key));
                // Adding level's attribute
                if (server.levels[key].loaded) document.getElementById(`manageLevel${key}Props`).innerHTML += "<i class='material-icons'>done</i>";
            }
        });
    }
    if (!document.getElementById("levelAddDialog").MDCDialog.open) {
        document.getElementById("levelAddGeneratorList").innerHTML = `<li class="mdc-list-item" role="option" aria-disabled="true">
                Normal
            </li>`;
        document.getElementById("levelAddGeneratorDefaultText").innerHTML = "Normal";
        Object.keys(server.generators).forEach(function(name) {
            document.getElementById("levelAddGeneratorList").innerHTML += `
                <li class="mdc-list-item" role="option" tabindex="0">
                    <i class="material-icons">terrain</i>&nbsp;&nbsp;${name}
                </li>`;
        });
        levelAddGeneratorSelect = new mdc.select.MDCSelect(document.getElementById("levelAddGeneratorSelect"));
    }
});




document.getElementById("levelAddDialog").MDCDialog = new mdc.dialog.MDCDialog(document.getElementById("levelAddDialog"));

document.getElementById("addLevelBtn").addEventListener("click", function(event) {
    document.getElementById("levelAddName").value = "";
    document.getElementById("levelAddName").parentElement.children[1].classList.remove("mdc-textfield__label--float-above");
    document.getElementById("levelAddSeed").value = require("crypto").createHash("sha256").update(
        Math.random() * 100000000 * require("electron").remote.process.pid +
        require("electron").remote.process.getProcessMemoryInfo() - require("electron").remote.process.getCPUUsage() +
        "").digest("hex");
    levelAddGeneratorSelect.selectedIndex = 0;
    document.getElementById("levelAddDialog").MDCDialog.show();
});
document.getElementById("addLevelLC").addEventListener("click", function(event) {
    document.getElementById("levelAddName").value = "";
    document.getElementById("levelAddName").parentElement.children[1].classList.remove("mdc-textfield__label--float-above");
    document.getElementById("levelAddSeed").value = require("crypto").createHash("sha256").update(
        Math.random() * 100000000 * require("electron").remote.process.pid +
        require("electron").remote.process.getProcessMemoryInfo() - require("electron").remote.process.getCPUUsage()
    ).digest("hex");
    levelAddGeneratorSelect.selectedIndex = 0;
    document.getElementById("levelAddDialog").MDCDialog.show();
});
// Adding level confirmation
document.getElementById("levelAddConfirm").addEventListener("click", function() {
    if (document.getElementById("levelAddName").value.length > 1) {
        var cmd = ("psmcoreactplugin createlevel4psm " +
            document.getElementById("levelAddName").value + " " +
            levelAddGeneratorSelect.value.replace('terrain&nbsp;&nbsp;', '').toLowerCase() + " " +
            require("buffer").Buffer.from(
                document.getElementById("levelAddSeed").value.toString(), "utf8"
            ).toString("hex").replace(/[^0-9]/g, parseInt(Math.random() * 10))).replace(/\r|\n/g, "");
        server.commands.push(cmd);
        ipcRenderer.send("setServer", window.server);
        top.main.snackbar("Generating level " + document.getElementById("levelAddName").value + "...");
    } else {
        top.main.snackbar("Please enter a name for your new level.");
    }
})



document.body.addEventListener("click", function() {
    if (MDCMenuLvl.open) MDCMenuLvl.open = false;
});



/**
 * Displays menu with informations for level
 */
window.displayLevelMenu = function(event, key) {
    console.log("Calling ", MDCMenuLvl, window.server.actions.levelActions, MDCMenuLvl.open);
    document.getElementById("menuActionsLevelList").innerHTML = "";
    Object.keys(window.server.actions.levelActions).forEach(function(name) {
        // Adding action
        var nameAsId = name.replace(/ /g, "_");
        document.getElementById("menuActionsLevelList").innerHTML += `
         <li class="mdc-list-item" 
         role="menuitem" tabindex="0"
         cmd="${server.actions.levelActions[name]}"
         level="${key}"
         onclick="window.server.commands.push(parseAsk(this.getAttribute('cmd').replace(/\%p/g, this.level), this.innerHTML, server.levels[this.level]));"
         id="manageLevelAction${nameAsId}">
             ${name}
         </li>`;
        mdc.ripple.MDCRipple.attachTo(document.getElementById(`manageLevel${key}Action${nameAsId}`));
        document.getElementById(`manageLevel${key}Action${nameAsId}`).setAttribute("cmd", server.actions.levelActions[name])
        document.getElementById(`manageLevel${key}Action${nameAsId}`).setAttribute("level", key)
        document.getElementById(`manageLevel${key}Action${nameAsId}`).addEventListener("click", function() {
            window.server.commands.push(parseAsk(this.getAttribute("cmd").replace(/\%p/g, this.level), this.innerHTML, server.levels[this.level]));
        });
    });
    document.getElementById("menuActionsLevel").style.left = (event.clientX - 170 /**Width**/ ).toString() + 'px';
    document.getElementById("menuActionsLevel").style.top = event.clientY + 'px';
    MDCMenuLvl.open = true;
    event.stopImmediatePropagation();
    event.stopPropagation();
}