import iziToast from "izitoast";
var focusedWindow;

export default {
    onload: ({ extensionAPI }) => {
        // TODO: config for output as attributes

        // https://www.zsolt.blog/2020/12/de-bonos-algorithms-of-thought-for_8.html
        extensionAPI.ui.commandPalette.addCommand({
            label: "AOT - Agreement, Disagreement and Irrelevance",
            callback: () => {
                const uid = window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];
                if (uid == undefined) {
                    alert("Please make sure to focus a block before starting an AOT");
                    return;
                } else {
                    window.roamAlphaAPI.updateBlock(
                        { block: { uid: uid, string: "Loading...".toString(), open: true } });
                    aot_adi(uid);
                }
            }
        });

        /*
        // https://www.debono.com/de-bono-thinking-lessons-1/4.-AGO-lesson-plan
        extensionAPI.ui.commandPalette.addCommand({
            label: "AOT - Aims, Goals, Objectives",
            callback: () => {
                const uid = window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];
                if (uid == undefined) {
                    alert("Please make sure to focus a block before starting an AOT");
                    return;
                } else {
                    window.roamAlphaAPI.updateBlock(
                        { block: { uid: uid, string: "Loading...".toString(), open: true } });
                    aot_ago(uid);
                }
            }
        });
        */
        /*
        // https://www.debono.com/de-bono-thinking-lessons-1/6.-APC-lesson-plan
        extensionAPI.ui.commandPalette.addCommand({
            label: "AOT - Alternatives, Possibilities, Choices",
            callback: () => {
                const uid = window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];
                if (uid == undefined) {
                    alert("Please make sure to focus a block before starting an AOT");
                    return;
                } else {
                    window.roamAlphaAPI.updateBlock(
                        { block: { uid: uid, string: "Loading...".toString(), open: true } });
                    aot_apc(uid);
                }
            }
        });
        */
        extensionAPI.ui.commandPalette.addCommand({
            label: "AOT - Assumptions X-ray",
            callback: () => {
                const uid = window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];
                if (uid == undefined) {
                    alert("Please make sure to focus a block before starting an AOT");
                    return;
                } else {
                    window.roamAlphaAPI.updateBlock(
                        { block: { uid: uid, string: "Loading...".toString(), open: true } });
                    aot_ax(uid);
                }
            }
        });
        extensionAPI.ui.commandPalette.addCommand({
            label: "AOT - Basic Decision",
            callback: () => {
                const uid = window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];
                if (uid == undefined) {
                    alert("Please make sure to focus a block before starting an AOT");
                    return;
                } else {
                    window.roamAlphaAPI.updateBlock(
                        { block: { uid: uid, string: "Loading...".toString(), open: true } });
                    aot_bd(uid);
                }
            }
        });
        extensionAPI.ui.commandPalette.addCommand({
            label: "AOT - Simple Choice",
            callback: () => {
                const uid = window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];
                if (uid == undefined) {
                    alert("Please make sure to focus a block before starting an AOT");
                    return;
                } else {
                    window.roamAlphaAPI.updateBlock(
                        { block: { uid: uid, string: "Loading...".toString(), open: true } });
                }
                aot_choice(uid);
            }
        });
        /*
        // https://www.debono.com/de-bono-thinking-lessons-1/3.-C%26S-lesson-plan
        extensionAPI.ui.commandPalette.addCommand({
            label: "AOT - Consequence and Sequel",
            callback: () => {
                const uid = window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];
                if (uid == undefined) {
                    alert("Please make sure to focus a block before starting an AOT");
                    return;
                } else {
                    window.roamAlphaAPI.updateBlock(
                        { block: { uid: uid, string: "Loading...".toString(), open: true } });
                }
                aot_cs(uid);
            }
        });
        */
        /*
        // https://www.debono.com/de-bono-thinking-lessons-1/2.-CAF-lesson-plan
        extensionAPI.ui.commandPalette.addCommand({
            label: "AOT - Consider All Factors",
            callback: () => {
                const uid = window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];
                if (uid == undefined) {
                    alert("Please make sure to focus a block before starting an AOT");
                    return;
                } else {
                    window.roamAlphaAPI.updateBlock(
                        { block: { uid: uid, string: "Loading...".toString(), open: true } });
                }
                aot_caf(uid);
            }
        });
        */
        /*
        extensionAPI.ui.commandPalette.addCommand({
            label: "AOT - Design/Decision, Outcome, Channels, Action",
            callback: () => {
                const uid = window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];
                if (uid == undefined) {
                    alert("Please make sure to focus a block before starting an AOT");
                    return;
                } else {
                    window.roamAlphaAPI.updateBlock(
                        { block: { uid: uid, string: "Loading...".toString(), open: true } });
                }
                aot_doca(uid);
            }
        });
        */
        extensionAPI.ui.commandPalette.addCommand({
            label: "AOT - Difference Engine",
            callback: () => {
                const uid = window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];
                if (uid == undefined) {
                    alert("Please make sure to focus a block before starting an AOT");
                    return;
                } else {
                    window.roamAlphaAPI.updateBlock(
                        { block: { uid: uid, string: "Loading...".toString(), open: true } });
                    aot_de(uid);
                }
            }
        });
        /*
        // https://www.zsolt.blog/2020/12/de-bonos-algorithms-of-thought-for_8.html
        extensionAPI.ui.commandPalette.addCommand({
            label: "AOT - Examine Both Sides",
            callback: () => {
                const uid = window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];
                if (uid == undefined) {
                    alert("Please make sure to focus a block before starting an AOT");
                    return;
                } else {
                    window.roamAlphaAPI.updateBlock(
                        { block: { uid: uid, string: "Loading...".toString(), open: true } });
                }
                aot_ebs(uid);
            }
        });
        */
        /*
        extensionAPI.ui.commandPalette.addCommand({
            label: "AOT - First Important Priorities",
            callback: () => {
                const uid = window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];
                if (uid == undefined) {
                    alert("Please make sure to focus a block before starting an AOT");
                    return;
                } else {
                    window.roamAlphaAPI.updateBlock(
                        { block: { uid: uid, string: "Loading...".toString(), open: true } });
                }
                aot_fip(uid);
            }
        });
        */
        /*
        extensionAPI.ui.commandPalette.addCommand({
            label: "AOT - Five Whys",
            callback: () => {
                const uid = window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];
                if (uid == undefined) {
                    alert("Please make sure to focus a block before starting an AOT");
                    return;
                } else {
                    window.roamAlphaAPI.updateBlock(
                        { block: { uid: uid, string: "Loading...".toString(), open: true } });
                }
                aot_fw(uid);
            }
        });
        */
        /*
        extensionAPI.ui.commandPalette.addCommand({
            label: "AOT - Issue Log",
            callback: () => {
                const uid = window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];
                if (uid == undefined) {
                    alert("Please make sure to focus a block before starting an AOT");
                    return;
                } else {
                    window.roamAlphaAPI.updateBlock(
                        { block: { uid: uid, string: "Loading...".toString(), open: true } });
                }
                aot_il(uid);
            }
        });
        */
        extensionAPI.ui.commandPalette.addCommand({
            label: "AOT - Next Action",
            callback: () => {
                const uid = window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];
                if (uid == undefined) {
                    alert("Please make sure to focus a block before starting an AOT");
                    return;
                } else {
                    window.roamAlphaAPI.updateBlock(
                        { block: { uid: uid, string: "Loading...".toString(), open: true } });
                    aot_na(uid);
                }
            }
        });
        /*
        // https://www.debono.com/de-bono-thinking-lessons-1/7.-OPV-lesson-plan
        extensionAPI.ui.commandPalette.addCommand({
            label: "AOT - Other People's Views",
            callback: () => {
                const uid = window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];
                if (uid == undefined) {
                    alert("Please make sure to focus a block before starting an AOT");
                    return;
                } else {
                    window.roamAlphaAPI.updateBlock(
                        { block: { uid: uid, string: "Loading...".toString(), open: true } });
                    aot_opv(uid);
                }
            }
        });
        */
        /*
        extensionAPI.ui.commandPalette.addCommand({
            label: "AOT - Pain Button",
            callback: () => {
                const uid = window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];
                if (uid == undefined) {
                    alert("Please make sure to focus a block before starting an AOT");
                    return;
                } else {
                    window.roamAlphaAPI.updateBlock(
                        { block: { uid: uid, string: "Loading...".toString(), open: true } });
                }
                aot_pb(uid);
            }
        });
        */
        extensionAPI.ui.commandPalette.addCommand({
            label: "AOT - Plus, Minus and Interesting",
            callback: () => {
                const uid = window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];
                if (uid == undefined) {
                    alert("Please make sure to focus a block before starting an AOT");
                    return;
                } else {
                    window.roamAlphaAPI.updateBlock(
                        { block: { uid: uid, string: "Loading...".toString(), open: true } });
                    aot_pmi(uid);
                }
            }
        });
        /*
        extensionAPI.ui.commandPalette.addCommand({
            label: "AOT - REALLY?",
            callback: () => {
                const uid = window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];
                if (uid == undefined) {
                    alert("Please make sure to focus a block before starting an AOT");
                    return;
                } else {
                    window.roamAlphaAPI.updateBlock(
                        { block: { uid: uid, string: "Loading...".toString(), open: true } });
                }
                aot_really(uid);
            }
        });
        */
        /*
        extensionAPI.ui.commandPalette.addCommand({
            label: "AOT - REAPPRAISED",
            callback: () => {
                const uid = window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];
                if (uid == undefined) {
                    alert("Please make sure to focus a block before starting an AOT");
                    return;
                } else {
                    window.roamAlphaAPI.updateBlock(
                        { block: { uid: uid, string: "Loading...".toString(), open: true } });
                }
                aot_reappraised(uid);
            }
        });
        */
        /*
        extensionAPI.ui.commandPalette.addCommand({
            label: "AOT - Recognise, Analyse, Divide",
            callback: () => {
                const uid = window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];
                if (uid == undefined) {
                    alert("Please make sure to focus a block before starting an AOT");
                    return;
                } else {
                    window.roamAlphaAPI.updateBlock(
                        { block: { uid: uid, string: "Loading...".toString(), open: true } });
                }
                aot_rad(uid);
            }
        });
        */
        /*
        extensionAPI.ui.commandPalette.addCommand({
            label: "AOT - Regret Minimisation",
            callback: () => {
                const uid = window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];
                if (uid == undefined) {
                    alert("Please make sure to focus a block before starting an AOT");
                    return;
                } else {
                    window.roamAlphaAPI.updateBlock(
                        { block: { uid: uid, string: "Loading...".toString(), open: true } });
                }
                aot_rm(uid);
            }
        });
        */
        /*
        extensionAPI.ui.commandPalette.addCommand({
            label: "AOT - Right to Disagree",
            callback: () => {
                const uid = window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];
                if (uid == undefined) {
                    alert("Please make sure to focus a block before starting an AOT");
                    return;
                } else {
                    window.roamAlphaAPI.updateBlock(
                        { block: { uid: uid, string: "Loading...".toString(), open: true } });
                }
                aot_rtd(uid);
            }
        });
        */
        /*
        extensionAPI.ui.commandPalette.addCommand({
            label: "AOT - SWOT analysis",
            callback: () => {
                const uid = window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];
                if (uid == undefined) {
                    alert("Please make sure to focus a block before starting an AOT");
                    return;
                } else {
                    window.roamAlphaAPI.updateBlock(
                        { block: { uid: uid, string: "Loading...".toString(), open: true } });
                }
                aot_swot(uid);
            }
        });
        */

        // https://www.zsolt.blog/2020/12/tosca-pattern-for-framing-problems.html
        extensionAPI.ui.commandPalette.addCommand({
            label: "AOT - TOSCA",
            callback: () => {
                const uid = window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];
                if (uid == undefined) {
                    alert("Please make sure to focus a block before starting an AOT");
                    return;
                } else {
                    window.roamAlphaAPI.updateBlock(
                        { block: { uid: uid, string: "Loading...".toString(), open: true } });
                }
                aot_tosca(uid);
            }
        });
        extensionAPI.ui.commandPalette.addCommand({
            label: "AOT - Want, Impediment, Remedy",
            callback: () => {
                const uid = window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];
                if (uid == undefined) {
                    alert("Please make sure to focus a block before starting an AOT");
                    return;
                } else {
                    window.roamAlphaAPI.updateBlock(
                        { block: { uid: uid, string: "Loading...".toString(), open: true } });
                    aot_wir(uid);
                }
            }
        });

        const args = {
            text: "AOTBASICDECISION",
            help: "AOT - Basic Decision",
            handler: (context) => () => {
                let uid = context.currentUid;
                aot_bd(uid);
                return "";
            }
        };
        const args1 = {
            text: "AOTNEXTACTION",
            help: "AOT - Next Action",
            handler: (context) => () => {
                let uid = context.currentUid;
                aot_na(uid);
                return "";
            }
        };
        const args2 = {
            text: "AOTWANT",
            help: "AOT - Want, Impediment, Remedy",
            handler: (context) => () => {
                let uid = context.currentUid;
                aot_wir(uid);
                return "";
            }
        };
        const args3 = {
            text: "AOTDIFFERENCE",
            help: "AOT - Difference Engine",
            handler: (context) => () => {
                let uid = context.currentUid;
                aot_de(uid);
                return "";
            }
        };
        const args4 = {
            text: "AOTPMI",
            help: "AOT - Plus, Minus and Interesting",
            handler: (context) => () => {
                let uid = context.currentUid;
                aot_pmi(uid);
                return "";
            }
        };
        const args5 = {
            text: "AOTTOSCA",
            help: "AOT - TOSCA",
            handler: (context) => () => {
                let uid = context.currentUid;
                aot_tosca(uid);
                return "";
            }
        };
        const args6 = {
            text: "AOTAX",
            help: "AOT - Assumptions X-Ray",
            handler: (context) => () => {
                let uid = context.currentUid;
                aot_ax(uid);
                return "";
            }
        };
        const args7 = {
            text: "AOTCHOICE",
            help: "AOT - Simple Choice",
            handler: (context) => () => {
                let uid = context.currentUid;
                aot_choice(uid);
                return "";
            }
        };
        const args8 = {
            text: "AOTADI",
            help: "AOT - Agreement, Disagreement and Irrelevance",
            handler: (context) => () => {
                let uid = context.currentUid;
                aot_adi(uid);
                return "";
            }
        };

        if (window.roamjs?.extension?.smartblocks) {
            window.roamjs.extension.smartblocks.registerCommand(args);
            window.roamjs.extension.smartblocks.registerCommand(args1);
            window.roamjs.extension.smartblocks.registerCommand(args2);
            window.roamjs.extension.smartblocks.registerCommand(args3);
            window.roamjs.extension.smartblocks.registerCommand(args4);
            window.roamjs.extension.smartblocks.registerCommand(args5);
            window.roamjs.extension.smartblocks.registerCommand(args6);
            window.roamjs.extension.smartblocks.registerCommand(args7);
            window.roamjs.extension.smartblocks.registerCommand(args8);
        } else {
            document.body.addEventListener(
                `roamjs:smartblocks:loaded`,
                () =>
                    window.roamjs?.extension.smartblocks &&
                    window.roamjs.extension.smartblocks.registerCommand(args) &&
                    window.roamjs.extension.smartblocks.registerCommand(args1) &&
                    window.roamjs.extension.smartblocks.registerCommand(args2) &&
                    window.roamjs.extension.smartblocks.registerCommand(args3) &&
                    window.roamjs.extension.smartblocks.registerCommand(args4) &&
                    window.roamjs.extension.smartblocks.registerCommand(args5) &&
                    window.roamjs.extension.smartblocks.registerCommand(args6) &&
                    window.roamjs.extension.smartblocks.registerCommand(args7) &&
                    window.roamjs.extension.smartblocks.registerCommand(args8)
            );
        }
    },
    onunload: () => {
        if (window.roamjs?.extension?.smartblocks) {
            window.roamjs.extension.smartblocks.unregisterCommand("AOTADI");
            window.roamjs.extension.smartblocks.unregisterCommand("AOTAX");
            window.roamjs.extension.smartblocks.unregisterCommand("AOTBASICDECISION");
            window.roamjs.extension.smartblocks.unregisterCommand("AOTCHOICE");
            window.roamjs.extension.smartblocks.unregisterCommand("AOTDIFFERENCE");
            window.roamjs.extension.smartblocks.unregisterCommand("AOTNEXTACTION");
            /*window.roamjs.extension.smartblocks.unregisterCommand("AOTOPV");*/
            window.roamjs.extension.smartblocks.unregisterCommand("AOTPMI");
            window.roamjs.extension.smartblocks.unregisterCommand("AOTTOSCA");
            window.roamjs.extension.smartblocks.unregisterCommand("AOTWANT");
        };
    }
}
// Agreement, Disagreement and Irrelevance - COMPLETE
async function aot_adi(uid) {
    var header = "**Situation:**";
    await window.roamAlphaAPI.updateBlock(
        { block: { uid: uid, string: "" + header + "".toString(), open: true } });

    let situationString = "What is the situation you wish to analyse?";
    let situation = await prompt(situationString, 1, "Agreement, Disagreement and Irrelevance");
    var situationBlock1 = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": uid, order: 0 },
        block: { string: situation.toString(), uid: situationBlock1 }
    });

    var agreeBlock = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": uid, order: 1 },
        block: { string: "**Agreement:**".toString(), uid: agreeBlock }
    });

    aot_adi_agree(uid, agreeBlock);
}
async function aot_adi_agree(uid, agreeBlock) {
    let existingItems = await window.roamAlphaAPI.q(`[:find (pull ?page [:node/title :block/string :block/uid {:block/children ...} ]) :where [?page :block/uid "${agreeBlock}"] ]`);
    var order = 0;
    if (existingItems[0][0].hasOwnProperty("children")) {
        order = existingItems[0][0].children.length;
    }

    let agree = await prompt("What is something about this situation on which you agree?", 1, "Agreement, Disagreement and Irrelevance");
    var agreeBlock1 = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": agreeBlock, order: order },
        block: { string: agree.toString(), uid: agreeBlock1 }
    });

    let more = await prompt("Are there any other things on which you agree?", 3, "Agreement, Disagreement and Irrelevance", null);
    if (more == "yes") {
        aot_adi_agree(uid, agreeBlock);
    } else if (more == "no") {
        var disagreeBlock = window.roamAlphaAPI.util.generateUID();    
        await window.roamAlphaAPI.createBlock({
            location: { "parent-uid": uid, order: 2 },
            block: { string: "**Disagreement:**".toString(), uid: disagreeBlock }
        });
        aot_adi_disagree(uid, disagreeBlock);
    }
}
async function aot_adi_disagree(uid, disagreeBlock) {
    let existingItems = await window.roamAlphaAPI.q(`[:find (pull ?page [:node/title :block/string :block/uid {:block/children ...} ]) :where [?page :block/uid "${disagreeBlock}"] ]`);
    var order = 0;
    if (existingItems[0][0].hasOwnProperty("children")) {
        order = existingItems[0][0].children.length;
    }

    let disagree = await prompt("What is something about this situation on which you disagree?", 1, "Agreement, Disagreement and Irrelevance");
    var disagreeBlock1 = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": disagreeBlock, order: order },
        block: { string: disagree.toString(), uid: disagreeBlock1 }
    });

    let more = await prompt("Are there any other things on which you disagree?", 3, "Agreement, Disagreement and Irrelevance", null);
    if (more == "yes") {
        aot_adi_disagree(uid, disagreeBlock);
    } else if (more == "no") {
        var irrBlock = window.roamAlphaAPI.util.generateUID();    
        await window.roamAlphaAPI.createBlock({
            location: { "parent-uid": uid, order: 3 },
            block: { string: "**Irrelevance:**".toString(), uid: irrBlock }
        });
        aot_adi_irr(uid, irrBlock);
    }
}
async function aot_adi_irr(uid, irrBlock) {
    let existingItems = await window.roamAlphaAPI.q(`[:find (pull ?page [:node/title :block/string :block/uid {:block/children ...} ]) :where [?page :block/uid "${irrBlock}"] ]`);
    var order = 0;
    if (existingItems[0][0].hasOwnProperty("children")) {
        order = existingItems[0][0].children.length;
    }

    let irrelevant = await prompt("What is something about your disagreement that is irrelevant?", 1, "Agreement, Disagreement and Irrelevance");
    var irrelevant1 = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": irrBlock, order: order },
        block: { string: irrelevant.toString(), uid: irrelevant1 }
    });

    let more = await prompt("Are there any other things that have been brought up that are irrelevant?", 3, "Agreement, Disagreement and Irrelevance", null);
    if (more == "yes") {
        aot_adi_irr(uid, irrBlock);
    }
}

// Alternatives, Possibilities, Choices

// Assumptions X-ray - COMPLETE
async function aot_ax(uid) {
    var header = "**Assumption X-Ray:**";
    await window.roamAlphaAPI.updateBlock(
        { block: { uid: uid, string: "" + header + "".toString(), open: true } });

    var newuid = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": uid, order: 0 },
        block: { string: "**General Assumptions:**", uid: newuid }
    });

    var newuid1 = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": newuid, order: 0 },
        block: { string: "Culturally Binding:", uid: newuid1 }
    });

    let cultString = "What are the culturally binding assumptions?";
    let cult = await prompt(cultString, 1, "Assumptions X-Ray");
    var cultBlock = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": newuid1, order: 0 },
        block: { string: cult.toString(), uid: cultBlock }
    });

    var newuid2 = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": newuid, order: 1 },
        block: { string: "Information Adequacy:", uid: newuid2 }
    });

    let infoString = "Is the available information correct? Is it complete?";
    let info = await prompt(infoString, 1, "Assumptions X-Ray");
    var infoBlock = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": newuid2, order: 0 },
        block: { string: info.toString(), uid: infoBlock }
    });

    var newuid3 = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": uid, order: 1 },
        block: { string: "**Assumptions at the crux:**", uid: newuid3 }
    });

    let cruxString = "What is the main crux of your assumptions?";
    let crux = await prompt(cruxString, 1, "Assumptions X-Ray");
    var cruxBlock = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": newuid3, order: 0 },
        block: { string: crux.toString(), uid: cruxBlock }
    });

    var newuid4 = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": uid, order: 2 },
        block: { string: "**Assumptions determining the constraints:**", uid: newuid4 }
    });

    var newuid5 = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": newuid4, order: 0 },
        block: { string: "Time:", uid: newuid5 }
    });

    let timeString = "What assumptions are there around time?";
    let time = await prompt(timeString, 1, "Assumptions X-Ray");
    var timeBlock = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": newuid5, order: 0 },
        block: { string: time.toString(), uid: timeBlock }
    });

    var newuid6 = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": newuid4, order: 1 },
        block: { string: "Money:", uid: newuid6 }
    });

    let moneyString = "What assumptions are there around money?";
    let money = await prompt(moneyString, 1, "Assumptions X-Ray");
    var moneyBlock = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": newuid6, order: 0 },
        block: { string: money.toString(), uid: moneyBlock }
    });

    var newuid7 = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": newuid4, order: 2 },
        block: { string: "Energy:", uid: newuid7 }
    });

    let energyString = "What assumptions are there around the energy required?";
    let energy = await prompt(energyString, 1, "Assumptions X-Ray");
    var energyBlock = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": newuid7, order: 0 },
        block: { string: energy.toString(), uid: energyBlock }
    });

    var newuid8 = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": newuid4, order: 3 },
        block: { string: "Cost/Benefit:", uid: newuid8 }
    });

    let cbString = "Is solving this problem worthwhile? What is the cost/benefit?";
    let cb = await prompt(cbString, 1, "Assumptions X-Ray");
    var cbBlock = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": newuid8, order: 0 },
        block: { string: cb.toString(), uid: cbBlock }
    });

    var newuid9 = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": newuid4, order: 4 },
        block: { string: "Cooperation:", uid: newuid9 }
    });

    let coopString = "Do I require the cooperation of anyone else? Do I hold assumptions about their views?";
    let coop = await prompt(coopString, 1, "Assumptions X-Ray");
    var coopBlock = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": newuid9, order: 0 },
        block: { string: coop.toString(), uid: coopBlock }
    });

    var newuid10 = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": newuid4, order: 5 },
        block: { string: "Physics:", uid: newuid10 }
    });

    let physString = "Do the laws of physics interfere? Is this problem insoluble?";
    let phys = await prompt(physString, 1, "Assumptions X-Ray");
    var physBlock = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": newuid10, order: 0 },
        block: { string: phys.toString(), uid: physBlock }
    });

    var newuid11 = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": newuid4, order: 6 },
        block: { string: "Law:", uid: newuid11 }
    });

    let lawString = "Is the solution blocked by law?";
    let law = await prompt(lawString, 1, "Assumptions X-Ray");
    var lawBlock = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": newuid11, order: 0 },
        block: { string: law.toString(), uid: lawBlock }
    });

    await prompt("Finally, look over your assumptions and consider whether there are more to add, or other things to consider.", 4, "Assumptions X-Ray:", null, 6000);
}

// Basic Decision functions - COMPLETE
async function aot_bd(uid) {
    focusedWindow = await window.roamAlphaAPI.ui.getFocusedBlock()?.["window-id"];

    var header = "Basic Decision::";
    await window.roamAlphaAPI.updateBlock(
        { block: { uid: uid, string: "" + header + "".toString(), open: true } });

    let choiceString = "What are you trying to decide?";
    let choice = await prompt(choiceString, 1, "Basic Decision");
    var choiceBlock = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": uid, order: 0 },
        block: { string: "#Choice: " + choice + "".toString(), uid: choiceBlock }
    });

    var optionsBlock = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": uid, order: 1 },
        block: { string: "**Options:**".toString(), uid: optionsBlock }
    });

    aot_bd_option(uid, optionsBlock, 1);
}
async function aot_bd_option(uid, optionsBlock, optionNumber) {
    var optionString;
    if (optionNumber == 1) {
        optionString = "What is your first option?";
    } else {
        optionString = "What is another option?";
    }

    let option = await prompt(optionString, 1, "Option");
    var thisOption = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": optionsBlock, order: (optionNumber - 1) },
        block: { string: "**" + option + ":**".toString(), uid: thisOption }
    });

    let adv = await prompt("What is one advantage of this option?", 1, "Option");
    var advBlock = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": thisOption, order: 0 },
        block: { string: "**Advantage:**", uid: advBlock }
    });
    var advBlock1 = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": advBlock, order: 0 },
        block: { string: adv.toString(), uid: advBlock1 }
    });

    let dis = await prompt("What is one disadvantage of this option?", 1, "Option");
    var disBlock = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": thisOption, order: 1 },
        block: { string: "**Disadvantage:**", uid: disBlock }
    });
    var disBlock1 = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": disBlock, order: 0 },
        block: { string: dis.toString(), uid: disBlock1 }
    });

    let finished = await prompt("Are there any more options?", 3, "Basic Decision")
    if (finished == "yes") {
        optionNumber = parseInt(optionNumber) + 1;
        aot_bd_option(uid, optionsBlock, optionNumber);
    } else if (finished == "no") {
        var constraintsBlock = window.roamAlphaAPI.util.generateUID();
        await window.roamAlphaAPI.createBlock({
            location: { "parent-uid": uid, order: 2 },
            block: { string: "**Constraints:**".toString(), uid: constraintsBlock }
        });
        aot_bd_constraints(uid, constraintsBlock, 1);
    }
}
async function aot_bd_constraints(uid, constraintsBlock, contstraintsNumber) {
    let constraints = await prompt("What is a constraint on this decision?", 1, "Constraint");

    var consBlock1 = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": constraintsBlock, order: (contstraintsNumber - 1) },
        block: { string: constraints.toString(), uid: consBlock1 }
    });

    let finished = await prompt("Are there any more constraints?", 3, "Basic Decision")
    if (finished == "yes") {
        contstraintsNumber = parseInt(contstraintsNumber) + 1;
        aot_bd_constraints(uid, constraintsBlock, contstraintsNumber);
    } else if (finished == "no") {
        aot_bd_finish(uid);
    }
}
async function aot_bd_finish(uid) {
    await prompt("Look over your options and consider if there are more advantages or disadvantages to add. Then, consider your constraints. Finally, record your decision!", 4, "Decision Time", null, 8000);
    var decisionBlock = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": uid, order: 3 },
        block: { string: "**Decision:**".toString(), uid: decisionBlock }
    });
    var decisionBlock1 = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": decisionBlock, order: 0 },
        block: { string: "".toString(), uid: decisionBlock1 }
    });

    await window.roamAlphaAPI.ui.setBlockFocusAndSelection(
        { location: { "block-uid": decisionBlock1, "window-id": focusedWindow } })
}

// Consequence and Sequel functions

// Consider All Factors functions

// Difference Engine functions - COMPLETE
async function aot_de(uid) {
    var header = "Difference Engine::";
    await window.roamAlphaAPI.updateBlock(
        { block: { uid: uid, string: "" + header + "".toString(), open: true } });

    var curUID = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": uid, order: 0 },
        block: { string: "**Current Situation:**".toString(), uid: curUID }
    });

    let current = await prompt("What is the Current Situation?", 1, "Difference Engine", null)
    var curUID1 = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": curUID, order: 0 },
        block: { string: current.toString(), uid: curUID1 }
    });

    var futUID = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": uid, order: 1 },
        block: { string: "**Future Situation:**".toString(), uid: futUID }
    });

    let future = await prompt("What is the situation in the Future?", 1, "Difference Engine", null)
    var futUID1 = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": futUID, order: 0 },
        block: { string: future.toString(), uid: futUID1 }
    });

    var difUID = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": uid, order: 2 },
        block: { string: "**Differences:**".toString(), uid: difUID }
    });

    aot_de_dif(uid, difUID);
}
async function aot_de_dif(uid, difUID) {
    let existingItems = await window.roamAlphaAPI.q(`[:find (pull ?page [:node/title :block/string :block/uid {:block/children ...} ]) :where [?page :block/uid "${difUID}"] ]`);
    var order = 0;
    if (existingItems[0][0].hasOwnProperty("children")) {
        order = existingItems[0][0].children.length;
    }

    let diff = await prompt("What is one difference?", 1, "Difference Engine")
    var diffUID1 = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": difUID, order: order },
        block: { string: diff.toString(), uid: diffUID1 }
    });

    let more = await prompt("Are there any more differences?", 3, "Difference Engine", null);
    if (more == "yes") {
        aot_de_dif(uid, difUID);
    } else if (more == "no") {
        aot_de_serious(uid, difUID);
    }
}
async function aot_de_serious(uid, difUID) {
    let differences = await window.roamAlphaAPI.q(`[:find (pull ?page [:node/title :block/string :block/uid {:block/children ...} ]) :where [?page :block/uid "${difUID}"] ]`);

    if (differences != undefined && differences[0][0].hasOwnProperty("children")) {
        var serUID = window.roamAlphaAPI.util.generateUID();
        await window.roamAlphaAPI.createBlock({
            location: { "parent-uid": uid, order: 3 },
            block: { string: "**Most serious difference:**", uid: serUID }
        });

        var selectString = "<select><option value=\"\">Select</option>";
        for (var j = 0; j < differences[0][0].children.length; j++) {
            selectString += "<option value=\"" + differences[0][0].children[j].uid + "\">" + differences[0][0].children[j].string + "</option>";
        }

        selectString += "</select>";
        let serious = await prompt("Which is the most serious difference?", 2, "Difference Engine", selectString);
        var serUID1 = window.roamAlphaAPI.util.generateUID();
        await window.roamAlphaAPI.createBlock({
            location: { "parent-uid": serUID, order: 0 },
            block: { string: "((" + serious.toString() + "))", uid: serUID1 }
        });

        var mitUID = window.roamAlphaAPI.util.generateUID();
        await window.roamAlphaAPI.createBlock({
            location: { "parent-uid": uid, order: 4 },
            block: { string: "**Steps to reduce the difference:**", uid: mitUID }
        });

        aot_de_mitigate(uid, mitUID);
    }
}
async function aot_de_mitigate(uid, mitUID) {
    let mitigating = await window.roamAlphaAPI.q(`[:find (pull ?page [:node/title :block/string :block/uid {:block/children ...} ]) :where [?page :block/uid "${mitUID}"] ]`);
    var order = 0;
    if (mitigating[0][0].hasOwnProperty("children")) {
        order = mitigating[0][0].children.length;
    }

    let mitigate = await prompt("Which is the most serious difference?", 1, "Difference Engine", null);
    var mitUID1 = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": mitUID, order: order },
        block: { string: mitigate.toString(), uid: mitUID1 }
    });

    let more = await prompt("Are there any more ways to mitigate the difference?", 3, "Difference Engine", null);
    if (more == "yes") {
        aot_de_mitigate(uid, mitUID)
    } else if (more == "no") {
        return;
    }
}

// First Important Priorities

// Issue Log functions

// Next Action functions - COMPLETE
async function aot_na(uid) {
    focusedWindow = await window.roamAlphaAPI.ui.getFocusedBlock()?.["window-id"];

    var header = "Next Action::";
    await window.roamAlphaAPI.updateBlock(
        { block: { uid: uid, string: "" + header + "".toString(), open: true } });

    let na = await prompt("Do you know the next action?", 3, "Next Action");
    if (na == "yes") {
        aot_na_yes(uid, 0);
    } else if (na == "no") {
        var brainstormingBlock = window.roamAlphaAPI.util.generateUID();
        await window.roamAlphaAPI.createBlock({
            location: { "parent-uid": uid, order: 0 },
            block: { string: "**Brainstorming:**".toString(), uid: brainstormingBlock }
        });
        aot_na_no(uid, brainstormingBlock, 1);
    }
}
async function aot_na_no(uid, brainstormingBlock, bsCount) {
    let existingItems = await window.roamAlphaAPI.q(`[:find (pull ?page [:node/title :block/string :block/uid {:block/children ...} ]) :where [?page :block/uid "${brainstormingBlock}"] ]`);
    var order = 0;

    if (existingItems[0][0].hasOwnProperty("children")) {
        order = existingItems[0][0].children.length;
    }
    var brainstormingBlock2 = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": brainstormingBlock, order: order },
        block: { string: "".toString(), uid: brainstormingBlock2 }
    });
    await window.roamAlphaAPI.ui.setBlockFocusAndSelection(
        { location: { "block-uid": brainstormingBlock2, "window-id": focusedWindow } })

    await prompt("Do a three-minute brainstorming session to come up with a next action", 5, "Brainstorming", null, 180000);

    let na = await prompt("Now do you know the next action?", 3, "Next Action")
    if (na == "yes") {
        aot_na_yes(uid, 1);
    } else if (na == "no") {
        aot_na_no(uid, brainstormingBlock, bsCount);
    }
}
async function aot_na_yes(uid, order) {
    let string = "What's the very next action?";
    let na = await prompt(string, 1, "Next Action");
    var naBlock = window.roamAlphaAPI.util.generateUID();
    aot_na_sim(uid, 1, na, naBlock);
}
async function aot_na_sim(uid, order, na, naBlock) {
    let string = "Now mentally simulate doing this action - " + na + ". Can you do it right now?";
    let na_now = await prompt(string, 3, "Next Action");
    if (na_now == "no") {
        aot_na_blocking(uid, order, na, naBlock);
    } else {
        await window.roamAlphaAPI.createBlock({
            location: { "parent-uid": uid, order: order },
            block: { string: "{{[[TODO]]}} " + na.toString(), uid: naBlock }
        });
    }
}
async function aot_na_blocking(uid, order, na, naBlock) {
    let string = "Create any other tasks you need to complete";
    let nablocking = await prompt(string, 1, "Next Action");

    var naBlock1 = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": uid, order: order },
        block: { string: "{{[[TODO]]}} " + nablocking.toString() + " #blocking [*](((" + naBlock + ")))", uid: naBlock1 }
    });

    let string1 = "Are there any other blocking tasks?";
    let na_now1 = await prompt(string1, 3, "Next Action");
    if (na_now1 == "yes") {
        order = order + 1;
        aot_na_blocking(uid, order, na, naBlock);
    } else {
        await window.roamAlphaAPI.createBlock({
            location: { "parent-uid": uid, order: order + 1 },
            block: { string: "{{[[TODO]]}} " + na.toString() + "", uid: naBlock }
        });
    }
}

// Other People's Views functions
async function aot_opv(uid) {
    let situation = await prompt("What is the situation?", 1, "Other People's Views");
    let string = "**Situation:** " + situation.toString();

    await sleep(20);
    await window.roamAlphaAPI.updateBlock(
        { block: { uid: uid, string: string, open: true } });

    var peopleUID = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": uid, order: 0 },
        block: { string: "{{table}}", uid: peopleUID }
    });
    aot_opv_people(uid, peopleUID);
}
async function aot_opv_people(uid, peopleUID) {
    let existingItems = await window.roamAlphaAPI.q(`[:find (pull ?page [:node/title :block/string :block/uid {:block/children ...} ]) :where [?page :block/uid "${peopleUID}"] ]`);
    var order = 0;
    if (existingItems[0][0].hasOwnProperty("children")) {
        order = existingItems[0][0].children.length;
    }

    let person = await prompt("Who is affected by this?", 1, "Other People's Views");
    var personUID = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": peopleUID, order: order },
        block: { string: person.toString(), uid: personUID }
    });

    let more = await prompt("Are there other people affected?", 3, "Other People's Views");
    if (more == "yes") {
        aot_opv_people(uid, peopleUID);
    } else if (more == "no") {
        aot_opv_views(uid, peopleUID);
    }
}
async function aot_opv_views(uid, peopleUID) {
    let existingItems = await window.roamAlphaAPI.q(`[:find (pull ?page [:node/title :block/string :block/uid {:block/children ...} ]) :where [?page :block/uid "${peopleUID}"] ]`);

    if (existingItems != undefined && existingItems[0][0].hasOwnProperty("children")) {
        for (var i = 0; i < existingItems[0][0].children.length; i++) {
            await aot_opv_getViews(existingItems[0][0].children[i].string, existingItems[0][0].children[i].uid);

            async function aot_opv_getViews(name, uid) {
                let existingItems = await window.roamAlphaAPI.q(`[:find (pull ?page [:node/title :block/string :block/uid {:block/children ...} ]) :where [?page :block/uid "${uid}"] ]`);
                var order = 0;
                if (existingItems[0][0].hasOwnProperty("children")) {
                    order = existingItems[0][0].children.length;
                }

                let view = await prompt("How does " + name + " view this situation?", 1, "Other People's Views");
                return (view);
            }

            var viewUID = window.roamAlphaAPI.util.generateUID();
            await window.roamAlphaAPI.createBlock({
                location: { "parent-uid": uid, order: order },
                block: { string: view.toString(), uid: viewUID }
            });

            let more = await prompt("Do they have any other views?", 3, "Want, Impediment, Remedy");
            if (more == "yes") {
                aot_opv_getViews(name, uid);
            }
        }
    }
}

// Pain Button functions

// Plus, Minus and Interesting functions - COMPLETE
async function aot_pmi(uid) {
    let situation = await prompt("What situation are you facing/considering?", 1, "Plus, Minus and Interesting");
    let string = "**Situation:** " + situation.toString();
    await sleep(20);
    await window.roamAlphaAPI.updateBlock(
        { block: { uid: uid, string: string, open: true } });

    var plusUID = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": uid, order: 0 },
        block: { string: "**Plus:**".toString(), uid: plusUID }
    });
    aot_pmi_plus(uid, plusUID);
}
async function aot_pmi_plus(uid, plusUID) {
    let existingItems = await window.roamAlphaAPI.q(`[:find (pull ?page [:node/title :block/string :block/uid {:block/children ...} ]) :where [?page :block/uid "${plusUID}"] ]`);
    var order = 0;
    if (existingItems[0][0].hasOwnProperty("children")) {
        order = existingItems[0][0].children.length;
    }

    let plus = await prompt("What is a positive aspect of this situation?", 1, "Plus, Minus and Interesting");
    var plusUID1 = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": plusUID, order: order },
        block: { string: plus.toString(), uid: plusUID1 }
    });

    let more = await prompt("Are there any more positive aspects to consider?", 3, "Plus, Minus and Interesting");
    if (more == "yes") {
        aot_pmi_plus(uid, plusUID);
    } else if (more == "no") {
        var minusUID = window.roamAlphaAPI.util.generateUID();
        await window.roamAlphaAPI.createBlock({
            location: { "parent-uid": uid, order: 1 },
            block: { string: "**Minus:**".toString(), uid: minusUID }
        });
        aot_pmi_minus(uid, minusUID);
    }
}
async function aot_pmi_minus(uid, minusUID) {
    let existingItems = await window.roamAlphaAPI.q(`[:find (pull ?page [:node/title :block/string :block/uid {:block/children ...} ]) :where [?page :block/uid "${minusUID}"] ]`);
    var order = 0;
    if (existingItems[0][0].hasOwnProperty("children")) {
        order = existingItems[0][0].children.length;
    }

    let minus = await prompt("What is a negative aspect of this situation?", 1, "Plus, Minus and Interesting");
    var minusUID1 = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": minusUID, order: order },
        block: { string: minus.toString(), uid: minusUID1 }
    });

    let more = await prompt("Are there any more negative aspects to consider?", 3, "Plus, Minus and Interesting");
    if (more == "yes") {
        aot_pmi_minus(uid, minusUID);
    } else if (more == "no") {
        var intUID = window.roamAlphaAPI.util.generateUID();
        await window.roamAlphaAPI.createBlock({
            location: { "parent-uid": uid, order: 2 },
            block: { string: "**Interesting:**".toString(), uid: intUID }
        });
        aot_pmi_int(uid, intUID);
    }
}
async function aot_pmi_int(uid, intUID) {
    let existingItems = await window.roamAlphaAPI.q(`[:find (pull ?page [:node/title :block/string :block/uid {:block/children ...} ]) :where [?page :block/uid "${intUID}"] ]`);
    var order = 0;
    if (existingItems[0][0].hasOwnProperty("children")) {
        order = existingItems[0][0].children.length;
    }

    let int = await prompt("What is an interesting aspect of this situation?", 1, "Plus, Minus and Interesting");
    var intUID1 = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": intUID, order: order },
        block: { string: int.toString(), uid: intUID1 }
    });

    let more = await prompt("Are there any more interesting aspects to consider?", 3, "Plus, Minus and Interesting");
    if (more == "yes") {
        aot_pmi_int(uid, intUID);
    } else if (more == "no") {
        return;
    }
}

// REALLY? functions

// REAPPRAISED functions

// Regret Minimisation functions

// Right to Disagree functions

// Simple Choice functions - COMPLETE
async function aot_choice(uid) {
    focusedWindow = await window.roamAlphaAPI.ui.getFocusedBlock()?.["window-id"];
    var header = "**{{[[TODO]]}} [[Choice]]:**";
    let choice = await prompt("What do you need to decide about?", 1, "Simple Choice");
    await sleep(50);
    await window.roamAlphaAPI.updateBlock(
        { block: { uid: uid, string: "" + header + " " + choice.toString(), open: true } });
    await sleep(50);
    var newuid = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": uid, order: 0 },
        block: { string: "**Constraints:**", uid: newuid }
    });
    aot_choice_constraints(uid, newuid, focusedWindow);
}
async function aot_choice_constraints(uid, newuid, focusedWindow) {
    let existingItems = await window.roamAlphaAPI.q(`[:find (pull ?page [:node/title :block/string :block/uid {:block/children ...} ]) :where [?page :block/uid "${newuid}"] ]`);
    var order = 0;
    if (existingItems[0][0].hasOwnProperty("children")) {
        order = existingItems[0][0].children.length;
    }

    let constraints = await prompt("What is one constraint?", 1, "Simple Choice");
    var constraintsUID = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": newuid, order: order },
        block: { string: constraints.toString(), uid: constraintsUID }
    });

    let more = await prompt("Are there any more constraints?", 3, "Simple Choice", null);
    if (more == "yes") {
        aot_choice_constraints(uid, newuid, focusedWindow);
    } else if (more == "no") {
        var optUID = window.roamAlphaAPI.util.generateUID();
        await window.roamAlphaAPI.createBlock({
            location: { "parent-uid": uid, order: 1 },
            block: { string: "**Options:**".toString(), uid: optUID }
        });
        aot_choice_options(uid, optUID, focusedWindow);
    }
}
async function aot_choice_options(uid, optUID, focusedWindow) {
    let existingItems = await window.roamAlphaAPI.q(`[:find (pull ?page [:node/title :block/string :block/uid {:block/children ...} ]) :where [?page :block/uid "${optUID}"] ]`);
    var order = 0;
    if (existingItems[0][0].hasOwnProperty("children")) {
        order = existingItems[0][0].children.length;
    }

    let options = await prompt("What is one option?", 1, "Simple Choice")
    var optionsUID = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": optUID, order: order },
        block: { string: options.toString(), uid: optionsUID }
    });

    let more = await prompt("Are there any more options?", 3, "Simple Choice", null);
    if (more == "yes") {
        aot_choice_options(uid, optUID, focusedWindow);
    } else if (more == "no") {
        var decUID = window.roamAlphaAPI.util.generateUID();
        await window.roamAlphaAPI.createBlock({
            location: { "parent-uid": uid, order: 2 },
            block: { string: "**Decision:**".toString(), uid: decUID }
        });
        aot_choice_decision(decUID, focusedWindow);
    }
}
async function aot_choice_decision(decUID, focusedWindow) {
    var decUID1 = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": decUID, order: 0 },
        block: { string: "", uid: decUID1 }
    });

    await window.roamAlphaAPI.ui.setBlockFocusAndSelection(
        { location: { "block-uid": decUID1, "window-id": focusedWindow } })
    await prompt("Look over your constraints and options, make your decision and record it here.", 4, "Simple Choice:", null, 4000);
}

// TOSCA functions - complete
async function aot_tosca(uid) {
    await sleep(20);
    await window.roamAlphaAPI.updateBlock(
        { block: { uid: uid, string: "**TOSCA:**", open: true } });

    let trouble = await prompt("What are the symptoms that make this problem real and present? Be specific. Avoid interpretation or solution ideas. Ask: \"Why now?\"", 1, "TOSCA");
    var troubleUID = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": uid, order: 0 },
        block: { string: "Trouble: ", uid: troubleUID }
    });
    var troubleUID1 = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": troubleUID, order: 0 },
        block: { string: trouble.toString(), uid: troubleUID1 }
    });

    let owner = await prompt("Whose problem is this?", 1, "TOSCA");
    var ownerUID = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": uid, order: 1 },
        block: { string: "Owner: ", uid: ownerUID }
    });
    var ownerUID1 = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": ownerUID, order: 0 },
        block: { string: owner.toString(), uid: ownerUID1 }
    });

    let sc = await prompt("What will success look like, and by when? Include a quantified target if possible.", 1, "TOSCA");
    var scUID = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": uid, order: 2 },
        block: { string: "Success Criteria: ", uid: scUID }
    });
    var scUID1 = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": scUID, order: 0 },
        block: { string: sc.toString(), uid: scUID1 }
    });

    var actorsUID = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": uid, order: 3 },
        block: { string: "Actors: ", uid: actorsUID }
    });

    aot_tosca_actors(uid, actorsUID)
}
async function aot_tosca_actors(uid, actorsUID) {
    let existingItems = await window.roamAlphaAPI.q(`[:find (pull ?page [:node/title :block/string :block/uid {:block/children ...} ]) :where [?page :block/uid "${actorsUID}"] ]`);
    var order = 0;
    if (existingItems[0][0].hasOwnProperty("children")) {
        order = existingItems[0][0].children.length;
    }

    let actors = await prompt("Which other stakeholders have a say, and what do they want?", 1, "TOSCA");
    var actorsUID1 = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": actorsUID, order: order },
        block: { string: actors.toString(), uid: actorsUID1 }
    });

    let more = await prompt("Are there any other stakeholders?", 3, "TOSCA", null);
    if (more == "yes") {
        aot_tosca_actors(uid, actorsUID);
    } else if (more == "no") {
        aot_tosca_coreQ(uid);
    }
}
async function aot_tosca_coreQ(uid) {
    let coreQ = await prompt("Now that you've considered the TOSCA items, what is the Core Question?", 1, "TOSCA");
    var coreQUID = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": uid, order: 4 },
        block: { string: "**Core Question:**", uid: coreQUID }
    });
    
    var coreQUID1 = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": coreQUID, order: 0 },
        block: { string: coreQ.toString(), uid: coreQUID1 }
    });    
}

// Want, Impediment, Remedy functions - COMPLETE
async function aot_wir(uid) {
    let want = await prompt("What do you want?", 1, "Want, Impediment, Remedy");
    let string = "[[I want]] " + want.toString();

    await sleep(20);
    await window.roamAlphaAPI.updateBlock(
        { block: { uid: uid, string: string, open: true } });

    let array = []
    aot_wir_impediment(uid, array);
}
async function aot_wir_impediment(uid, array) {
    let existingItems = await window.roamAlphaAPI.q(`[:find (pull ?page [:node/title :block/string :block/uid {:block/children ...} ]) :where [?page :block/uid "${uid}"] ]`);
    var order = 0;
    if (existingItems[0][0].hasOwnProperty("children")) {
        order = existingItems[0][0].children.length;
    }

    let imp = await prompt("What is an impediment to achieving this?", 1, "Want, Impediment, Remedy");
    var impUID = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": uid, order: order },
        block: { string: "Impediment: " + imp.toString(), uid: impUID }
    });
    let rem = await prompt("How can I remedy this impediment?", 1, "Want, Impediment, Remedy");
    var remUID = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": impUID, order: 0 },
        block: { string: "Remedy: " + rem.toString(), uid: remUID }
    });
    array.push(remUID)
    let more = await prompt("Are there any more impediments?", 3, "Want, Impediment, Remedy");
    if (more == "yes") {
        aot_wir_impediment(uid, array);
    } else if (more == "no") {
        aot_wir_finish(uid, order, array);
    }
}
async function aot_wir_finish(uid, order, array) {
    order = order + 1;
    var actUID = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
        location: { "parent-uid": uid, order: order },
        block: { string: "Actions: ", uid: actUID }
    });

    if (array.length > 0) {
        for (var i = 0; i < array.length; i++) {
            var thisUID = window.roamAlphaAPI.util.generateUID();
            await window.roamAlphaAPI.createBlock({
                location: { "parent-uid": actUID, order: i },
                block: { string: "((" + array[i].toString() + "))", uid: thisUID }
            });
        }
    }
}

// helper functions

async function prompt(string, type, title, selectString, timer) {
    if (type == 1) { // input
        return new Promise((resolve) => {
            iziToast.question({
                theme: 'dark', // dark
                color: '', // blue, red, green, yellow
                layout: 2,
                drag: false,
                timeout: false,
                close: false,
                overlay: true,
                displayMode: 2,
                id: "question",
                title: title,
                message: string,
                position: "center",
                inputs: [
                    [
                        '<input type="text" placeholder="">',
                        "keyup",
                        function (instance, toast, input, e) {
                            if (e.code === "Enter") {
                                instance.hide({ transitionOut: "fadeOut" }, toast, "button");
                                resolve(e.srcElement.value);
                            }
                        },
                        true,
                    ],
                ],
                buttons: [
                    [
                        "<button><b>Confirm</b></button>",
                        async function (instance, toast, button, e, inputs) {
                            instance.hide({ transitionOut: "fadeOut" }, toast, "button");
                            resolve(inputs[0].value);
                        },
                        false,
                    ],
                    [
                        "<button>Cancel</button>",
                        async function (instance, toast, button, e) {
                            instance.hide({ transitionOut: "fadeOut" }, toast, "button");
                        },
                    ],
                ],
                onClosing: function (instance, toast, closedBy) { },
                onClosed: function (instance, toast, closedBy) { },
            });
        })
    } else if (type == 2) { // select
        return new Promise((resolve) => {
            iziToast.question({
                theme: 'dark', // dark
                color: '', // blue, red, green, yellow
                layout: 2,
                drag: false,
                timeout: false,
                close: false,
                overlay: true,
                title: title,
                message: string,
                position: 'center',
                inputs: [
                    [selectString, 'change', function (instance, toast, select, e) { }]
                ],
                buttons: [
                    ['<button><b>Confirm</b></button>', function (instance, toast, button, e, inputs) {
                        instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
                        resolve(inputs[0].options[inputs[0].selectedIndex].value);
                    }, false], // true to focus
                    [
                        "<button>Cancel</button>",
                        function (instance, toast, button, e) {
                            instance.hide({ transitionOut: "fadeOut" }, toast, "button");
                        },
                    ],
                ]
            });
        })
    } else if (type == 3) { // yes/no
        return new Promise((resolve) => {
            iziToast.question({
                theme: 'dark', // dark
                color: '', // blue, red, green, yellow
                layout: 2,
                drag: false,
                timeout: false,
                close: false,
                overlay: true,
                displayMode: 2,
                id: "question",
                title: title,
                message: string,
                position: "center",
                buttons: [
                    [
                        "<button>Yes</button>",
                        async function (instance, toast, button, e) {
                            instance.hide({ transitionOut: "fadeOut" }, toast, "button");
                            resolve("yes");
                        },
                        false,
                    ],
                    [
                        "<button>No</button>",
                        async function (instance, toast, button, e) {
                            instance.hide({ transitionOut: "fadeOut" }, toast, "button");
                            resolve("no");
                        },
                    ],
                ],
                onClosing: function (instance, toast, closedBy) { },
                onClosed: function (instance, toast, closedBy) { },
            });
        })
    } else if (type == 4) { // toast
        return new Promise((resolve) => {
            iziToast.show({
                id: null,
                class: '',
                title: title,
                titleColor: '',
                titleSize: '',
                titleLineHeight: '',
                message: string,
                messageColor: '',
                messageSize: '',
                messageLineHeight: '',
                backgroundColor: '',
                theme: 'dark', // dark
                color: '', // blue, red, green, yellow
                icon: '',
                iconText: '',
                iconColor: '',
                iconUrl: null,
                image: '',
                imageWidth: 50,
                maxWidth: null,
                zindex: null,
                layout: 1,
                balloon: false,
                close: true,
                closeOnEscape: true,
                closeOnClick: true,
                displayMode: 0, // once, replace
                position: 'center', // bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter, center
                target: '',
                targetFirst: true,
                timeout: timer,
                rtl: false,
                animateInside: true,
                drag: true,
                pauseOnHover: true,
                resetOnHover: false,
                progressBar: true,
                progressBarColor: '',
                progressBarEasing: 'linear',
                overlay: false,
                overlayClose: false,
                overlayColor: 'rgba(0, 0, 0, 0.6)',
                transitionIn: 'fadeInUp',
                transitionOut: 'fadeOut',
                transitionInMobile: 'fadeInUp',
                transitionOutMobile: 'fadeOutDown',
                buttons: {},
                inputs: {},
                onOpening: function () { },
                onOpened: function () { },
                onClosing: function () { },
                onClosed: function () { resolve("completed cycle"); }
            });
        })
    } else if (type == 5) { // brainstorming
        return new Promise((resolve) => {
            iziToast.show({
                id: null,
                class: '',
                title: title,
                titleColor: '',
                titleSize: '',
                titleLineHeight: '',
                message: string,
                messageColor: '',
                messageSize: '',
                messageLineHeight: '',
                backgroundColor: '',
                theme: 'dark', // dark
                color: '', // blue, red, green, yellow
                icon: '',
                iconText: '',
                iconColor: '',
                iconUrl: null,
                image: '',
                imageWidth: 50,
                maxWidth: null,
                zindex: null,
                layout: 1,
                balloon: false,
                close: true,
                closeOnEscape: true,
                closeOnClick: true,
                displayMode: 0, // once, replace
                position: 'bottomRight', // bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter, center
                target: '',
                targetFirst: true,
                timeout: timer,
                rtl: false,
                animateInside: true,
                drag: true,
                pauseOnHover: true,
                resetOnHover: false,
                progressBar: true,
                progressBarColor: '',
                progressBarEasing: 'linear',
                overlay: false,
                overlayClose: false,
                overlayColor: 'rgba(0, 0, 0, 0.6)',
                transitionIn: 'fadeInUp',
                transitionOut: 'fadeOut',
                transitionInMobile: 'fadeInUp',
                transitionOutMobile: 'fadeOutDown',
                buttons: {},
                inputs: {},
                onOpening: function () { },
                onOpened: function () { },
                onClosing: function () { },
                onClosed: function () { resolve("completed cycle"); }
            });
        })
    }
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}